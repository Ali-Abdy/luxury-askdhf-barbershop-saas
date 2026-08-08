import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AnimatedPage } from "@/components/shared/animated-page";
import { services } from "@/data/services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: "Services | Luxury Barbershop",
  description: "Discover premium haircuts, beard grooming, and traditional barber services.",
};

export default function ServicesPage() {
  const t = useTranslations('nav');
  return (
    <PageWrapper>
      <AnimatedPage>
        <Section className="py-24">
          <Container>
            <h1 className="text-4xl font-light mb-16 text-center">Our Services</h1>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.id} className="group overflow-hidden hover:border-amber-600 transition-all">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={service.image}
                      alt={`Photo of ${service.name}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-medium">{service.name}</h3>
                    <p className="text-neutral-500 mt-2 text-sm">{service.description}</p>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-amber-700 font-semibold">{service.price}</span>
                      <span className="text-neutral-400 text-sm">{service.duration}</span>
                    </div>
                    <Button asChild className="w-full mt-4" variant="gold">
                      <Link href={`/booking?service=${service.id}`}>Book Now</Link>
              </Button>
            </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      </AnimatedPage>
    </PageWrapper>
  );
}

