"use client";

import { useState, useMemo } from "react";
import { CheckCircle, Circle, ChevronRight, Pencil, ChevronLeft, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookingSidebar() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [locationType, setLocationType] = useState<"onsite" | "virtual">("virtual");
  const [negotiationType, setNegotiationType] = useState<string>("selling-business");

  // Step 2 State: Date Selection
  const [duration, setDuration] = useState<2 | 3>(2);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Step 3 State: NDA
  const [ndaDetails, setNdaDetails] = useState({ firstName: "", lastName: "", email: "" });
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // Booking State
  const [isBooking, setIsBooking] = useState(false);

  // --- Calendar Logic ---
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Auto-advance after short delay for better UX
    setTimeout(() => setActiveStep(3), 300);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const formatDateRange = (start: Date | null, days: number) => {
    if (!start) return "(Select date)";
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    
    const startStr = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return `(${startStr} - ${endStr})`;
  };

  // --- NDA Logic ---
  const handleSignNDA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API
    setIsSigned(true);
    setIsSigning(false);
    setActiveStep(4);
  };

  // --- Booking Logic ---
  const isFormValid = selectedDate !== null && isSigned;

  const handleBook = async () => {
    if (!isFormValid) return;
    setIsBooking(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: ndaDetails.firstName,
          lastName: ndaDetails.lastName,
          email: ndaDetails.email,
          type: negotiationType,
          date: selectedDate,
          duration: duration
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Booking Request Sent Successfully! Please check your email.");
      } else {
        alert(`Booking Failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 overflow-y-auto w-full max-w-md border-r border-slate-200">
      <div className="p-6 space-y-8 flex-1">
        
        {/* Step 1: Pick location */}
        <div className="space-y-4">
          <div 
            className="flex items-baseline gap-3 cursor-pointer group"
            onClick={() => setActiveStep(1)}
          >
            <span className={`text-3xl font-bold ${activeStep === 1 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>1</span>
            <h2 className={`text-2xl font-bold ${activeStep === 1 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>
              Pick location <span className="text-base font-normal text-slate-400">({locationType === 'virtual' ? 'Virtual' : 'On-Site'})</span>
            </h2>
          </div>
          
          {activeStep === 1 && (
            <div className="bg-slate-100 p-1 rounded-full flex relative animate-in slide-in-from-top-2 duration-200">
              <div 
                className={`absolute top-1 bottom-1 w-[48%] rounded-full transition-all duration-300 ease-in-out bg-[#557755] shadow-sm ${locationType === 'virtual' ? 'left-[51%]' : 'left-1'}`}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setLocationType("onsite"); }}
                className={`flex-1 py-2 text-center rounded-full text-sm font-medium z-10 transition-colors duration-300 ${locationType === "onsite" ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                On-Site
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLocationType("virtual"); }}
                className={`flex-1 py-2 text-center rounded-full text-sm font-medium z-10 transition-colors duration-300 ${locationType === "virtual" ? "text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                Virtual
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Select visit duration */}
        <div className="space-y-4">
           <div 
             className="flex items-baseline gap-3 cursor-pointer group"
             onClick={() => setActiveStep(2)}
           >
            <span className={`text-3xl font-bold ${activeStep === 2 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>2</span>
            <div className="flex-1 flex justify-between items-baseline">
               <h2 className={`text-xl font-bold ${activeStep === 2 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>Select a visit date</h2>
               <span className="text-sm text-slate-400 group-hover:text-slate-600 flex items-center gap-2">
                 {selectedDate ? formatDateRange(selectedDate, duration) : ""}
                 {selectedDate && <Pencil className="h-3 w-3" />}
               </span>
            </div>
          </div>
          
          {activeStep === 2 && (
             <div className="p-4 bg-slate-50 rounded-lg animate-in slide-in-from-top-2 duration-200 border border-slate-100">
               {/* Duration Toggle */}
               <div className="flex gap-2 mb-4">
                 <button 
                   onClick={() => setDuration(2)}
                   className={`flex-1 py-1.5 text-sm font-medium rounded-md border transition-all ${duration === 2 ? 'border-[#557755] bg-[#EEF5EE] text-[#557755]' : 'border-slate-200 bg-white text-slate-600'}`}
                 >
                   2 Days
                 </button>
                 <button 
                   onClick={() => setDuration(3)}
                   className={`flex-1 py-1.5 text-sm font-medium rounded-md border transition-all ${duration === 3 ? 'border-[#557755] bg-[#EEF5EE] text-[#557755]' : 'border-slate-200 bg-white text-slate-600'}`}
                 >
                   3 Days
                 </button>
               </div>

               {/* Calendar Header */}
               <div className="flex items-center justify-between mb-4">
                 <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded-full"><ChevronLeft className="h-4 w-4 text-slate-600" /></button>
                 <span className="text-sm font-semibold text-slate-900">
                   {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded-full"><ChevronRight className="h-4 w-4 text-slate-600" /></button>
               </div>

               {/* Calendar Grid */}
               <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                 {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-slate-400 font-medium py-1">{d}</span>)}
               </div>
               <div className="grid grid-cols-7 gap-y-1">
                 {calendarDays.map((date, i) => {
                   if (!date) return <div key={i} />;
                   
                   // Range Logic
                   let isSelected = false;
                   let isRangeStart = false;
                   let isRangeEnd = false;
                   let isInRange = false;

                   if (selectedDate) {
                     const start = new Date(selectedDate);
                     const end = new Date(selectedDate);
                     end.setDate(start.getDate() + duration - 1);
                     
                     const current = date.getTime();
                     const sTime = start.getTime();
                     const eTime = end.getTime();

                     if (current === sTime) isRangeStart = true;
                     if (current === eTime) isRangeEnd = true;
                     if (current > sTime && current < eTime) isInRange = true;
                     isSelected = isRangeStart || isRangeEnd || isInRange;
                   }

                   const isToday = new Date().toDateString() === date.toDateString();
                   
                   return (
                     <div key={i} className="relative w-full aspect-square flex items-center justify-center">
                       {/* Connecting Background for Range */}
                       {isInRange && <div className="absolute inset-y-1 left-0 right-0 bg-[#EEF5EE]" />}
                       {isRangeStart && <div className="absolute inset-y-1 left-1/2 right-0 bg-[#EEF5EE] rounded-l-full" />}
                       {isRangeEnd && <div className="absolute inset-y-1 left-0 right-1/2 bg-[#EEF5EE] rounded-r-full" />}

                       <button
                         onClick={() => handleDateSelect(date)}
                         className={`
                           relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                           ${(isRangeStart || isRangeEnd) ? 'bg-[#557755] text-white font-bold shadow-sm' : ''}
                           ${isInRange ? 'text-[#557755] font-medium' : ''}
                           ${!isSelected ? 'hover:bg-slate-100 text-slate-700' : ''}
                           ${isToday && !isSelected ? 'border border-[#557755] text-[#557755]' : ''}
                         `}
                       >
                         {date.getDate()}
                       </button>
                     </div>
                   );
                 })}
               </div>
             </div>
          )}
        </div>

        {/* Step 3: Sign NDA */}
        <div className="space-y-4">
           <div 
             className="flex items-baseline gap-3 cursor-pointer group"
             onClick={() => setActiveStep(3)}
           >
            <span className={`text-3xl font-bold ${activeStep === 3 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>3</span>
            <div className="flex-1 flex justify-between items-baseline">
               <h2 className={`text-xl font-bold ${activeStep === 3 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>Sign an NDA</h2>
               <span className={`text-sm flex items-center gap-1 ${isSigned ? 'text-[#557755] font-medium' : 'text-slate-400'}`}>
                 {isSigned ? <><CheckCircle className="h-3 w-3" /> Signed</> : "(pending)"}
               </span>
            </div>
          </div>
          
          {activeStep === 3 && !isSigned && (
             <form onSubmit={handleSignNDA} className="p-4 bg-slate-50 rounded-lg animate-in slide-in-from-top-2 duration-200 space-y-3 border border-slate-100">
               <div className="grid grid-cols-2 gap-3">
                 <Input 
                   placeholder="First Name" 
                   value={ndaDetails.firstName} 
                   onChange={(e) => setNdaDetails({...ndaDetails, firstName: e.target.value})}
                   required 
                   className="bg-white"
                 />
                 <Input 
                   placeholder="Last Name" 
                   value={ndaDetails.lastName} 
                   onChange={(e) => setNdaDetails({...ndaDetails, lastName: e.target.value})}
                   required 
                   className="bg-white"
                 />
               </div>
               <Input 
                 type="email" 
                 placeholder="Email Address" 
                 value={ndaDetails.email} 
                 onChange={(e) => setNdaDetails({...ndaDetails, email: e.target.value})}
                 required 
                 className="bg-white"
               />
               <Button type="submit" className="w-full bg-[#557755] hover:bg-[#446644] text-white" disabled={isSigning}>
                 {isSigning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...</> : "Sign NDA"}
               </Button>
               <p className="text-[10px] text-slate-400 text-center px-2">
                 By clicking sign, you agree to the Terms of Service and Privacy Policy.
               </p>
             </form>
          )}
        </div>

        {/* Step 4: Choose negotiation type */}
        <div className="space-y-4">
          <div 
            className="flex items-baseline gap-3 cursor-pointer group"
            onClick={() => setActiveStep(4)}
          >
            <span className={`text-3xl font-bold ${activeStep === 4 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>4</span>
            <h2 className={`text-2xl font-bold ${activeStep === 4 ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}>Choose negotiation type</h2>
          </div>

          {activeStep === 4 && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              {[
                { id: "selling-business", label: "Selling a business or shares in a business" },
                { id: "buying-business", label: "Buying a business or shares in a business" },
                { id: "buying-asset", label: "Buying a non-corporate asset" },
                { id: "selling-asset", label: "Selling a non-corporate asset" },
                { id: "other", label: "Other" },
              ].map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setNegotiationType(option.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer flex items-center transition-all ${
                    negotiationType === option.id 
                      ? "border-slate-200 bg-white" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    negotiationType === option.id ? "border-[#557755]" : "border-slate-300"
                  }`}>
                    {negotiationType === option.id && <div className="h-3 w-3 rounded-full bg-[#557755]" />}
                  </div>
                  <span className="text-slate-700 font-medium">{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-3">
          <Button 
            onClick={handleBook}
            disabled={!isFormValid || isBooking}
            variant="outline" 
            className={`flex-1 h-auto py-3 border-none rounded-xl flex flex-col items-center justify-center gap-0 transition-colors
              ${isFormValid ? 'bg-[#EEF5EE] hover:bg-[#E0EBE0] text-slate-700 hover:text-slate-900 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <span className="text-base font-normal">Book the date</span>
            <span className="text-sm font-light">pay later</span>
          </Button>
          <Button 
            onClick={handleBook}
            disabled={!isFormValid || isBooking}
            className={`flex-1 h-auto py-3 text-white rounded-xl flex flex-col items-center justify-center gap-0 transition-colors
              ${isFormValid ? 'bg-[#557755] hover:bg-[#446644] cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            {isBooking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span className="text-base font-normal">Book the date</span>
                <span className="text-sm font-light">pay now</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Logo */}
        <div className="mt-8 mb-2">
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold tracking-tighter leading-none text-slate-900">M&A</span>
            <span className="text-4xl font-extrabold tracking-tighter leading-none text-slate-900">NOW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
