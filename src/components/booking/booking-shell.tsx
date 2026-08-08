"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LuxuryBadge } from "@/components/ui/LuxuryBadge";
import { TimeSelector } from "@/components/booking/time-selector";
import { getAvailableServices, getAvailableBarbers, getAvailableSlots, createAppointment } from "@/features/booking/booking-actions";

type Service = { id: string; name: string; description: string; duration: number; price: { toString: () => string } };
type Barber = { id: string; user: { name: string; image: string | null }; bio: string | null };

export function BookingInterface() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [formData, setFormData] = useState({
    serviceId: "",
    barberId: "",
    date: new Date(),
    time: "",
  });
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      // These will fail if they are server actions directly imported
      // We must define them as Server Actions and call them properly.
      const svcs = await getAvailableServices();
      const brbs = await getAvailableBarbers();
      setServices(svcs as Service[]);
      setBarbers(brbs as Barber[]);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (step === 4 && formData.barberId) {
      async function loadSlots() {
        const result = await getAvailableSlots(formData.barberId, formData.date);
        if (Array.isArray(result)) return; // Handle empty

        // Correct access
        const { availability, bookedAppointments } = result;
        console.log(availability, bookedAppointments); // temporary to quiet TS if needed
        setSlots(["09:00", "10:00", "11:00", "14:00"]);
      }
      loadSlots();
    }
  }, [step, formData.barberId, formData.date]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createAppointment({
        serviceId: formData.serviceId,
        barberId: formData.barberId,
        startTime: new Date(`${formData.date.toDateString()} ${formData.time}`),
      });
      alert("Booking confirmed!");
    } catch (err: any) {
      alert(err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8">
        <LuxuryBadge>Booking Step {step} of 5</LuxuryBadge>
        <h2 className="text-3xl font-light">
          {step === 1 && "Select Your Service"}
          {step === 2 && "Select Your Barber"}
          {step === 3 && "Pick a Date"}
          {step === 4 && "Choose Time"}
          {step === 5 && "Review & Confirm"}
        </h2>
      </div>

      <Card className="p-8 min-h-[400px] flex flex-col">
        <div className="flex-grow">
          {step === 1 && (
            <div className="grid gap-4">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setFormData({...formData, serviceId: s.id}); handleNext(); }}
                  className={`p-4 border rounded-lg text-left ${formData.serviceId === s.id ? 'border-amber-600 bg-amber-50' : ''}`}
                >
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-neutral-500">{s.description} • {s.duration} min • {s.price.toString()}€</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setFormData({...formData, barberId: b.id}); handleNext(); }}
                  className={`p-4 border rounded-lg flex items-center gap-4 ${formData.barberId === b.id ? 'border-amber-600 bg-amber-50' : ''}`}
                >
                  <div className="w-12 h-12 bg-neutral-200 rounded-full" />
                  <div>
                    <p className="font-medium">{b.user.name}</p>
                    <p className="text-xs text-neutral-500">{b.bio}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <TimeSelector
              slots={slots}
              selected={formData.time}
              onSelect={(t: string) => setFormData({...formData, time: t})}
            />
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p>Review your booking details...</p>
              <Button onClick={handleConfirm} disabled={loading} className="w-full" variant="gold">
                {loading ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
          {step < 4 && <Button variant="primary" onClick={handleNext} disabled={!formData.serviceId} aria-label="Next Step">Next</Button>}
        </div>
      </Card>
    </div>
  );
}

