import { Server, Socket } from 'socket.io';
import {
  SubscribeToAreaData,
  ConsultantLocationUpdate,
  User
} from '@ma-consultant/shared';
import { getConsultants, updateConsultantLocation } from '../database/db';
import { haversineDistance } from '../utils/distance';

interface AuthenticatedSocket extends Socket {
  user?: User;
  subscribedArea?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export function initializeHandlers(socket: AuthenticatedSocket, io: Server): void {
  /**
   * Client subscribes to consultants in a specific geographic area
   */
  socket.on('consultants:subscribe', (data: SubscribeToAreaData) => {
    console.log(`Client ${socket.id} subscribing to area:`, data);

    // Store subscription info
    socket.subscribedArea = {
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius || 50 // Default 50km
    };

    // Join a room based on the area (for future optimization)
    const roomName = `area_${Math.floor(data.latitude)}_${Math.floor(data.longitude)}`;
    socket.join(roomName);

    // Send current consultants in the area
    const consultants = getConsultants().value();
    const nearbyConsultants = consultants
      .filter((consultant: any) => {
        if (!consultant.currentLocation) return false;

        const distance = haversineDistance(
          data.latitude,
          data.longitude,
          consultant.currentLocation.latitude,
          consultant.currentLocation.longitude
        );

        return distance <= (data.radius || 50);
      })
      .map((consultant: any) => ({
        consultantId: consultant.id,
        location: consultant.currentLocation,
        availability: consultant.availability
      }));

    // Send initial data
    socket.emit('consultants:initial', {
      consultants: nearbyConsultants,
      count: nearbyConsultants.length
    });

    console.log(`Sent ${nearbyConsultants.length} consultants to client ${socket.id}`);
  });

  /**
   * Client unsubscribes from area updates
   */
  socket.on('consultants:unsubscribe', () => {
    console.log(`Client ${socket.id} unsubscribing`);
    socket.subscribedArea = undefined;

    // Leave all rooms
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
  });

  /**
   * Consultant updates their location (for manual updates)
   */
  socket.on('location:update', (data: { latitude: number; longitude: number }) => {
    if (!socket.user) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    if (socket.user.role !== 'consultant') {
      socket.emit('error', { message: 'Only consultants can update location' });
      return;
    }

    console.log(`Consultant ${socket.user.email} updated location:`, data);

    // Find consultant record
    const consultants = getConsultants().value();
    const consultant = consultants.find((c: any) => c.userId === socket.user!.id);

    if (!consultant) {
      socket.emit('error', { message: 'Consultant record not found' });
      return;
    }

    // Update location in database
    updateConsultantLocation(consultant.id, {
      latitude: data.latitude,
      longitude: data.longitude
    });

    // Broadcast to all clients
    const update: ConsultantLocationUpdate = {
      consultantId: consultant.id,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date().toISOString()
      },
      availability: consultant.availability
    };

    io.emit('consultant:location', update);
  });

  /**
   * Ping/Pong for connection health check
   */
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
}
