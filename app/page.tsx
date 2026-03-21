import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Industries from "@/components/sections/Industries";
import Technologies from "@/components/sections/Technologies";
import Stats from "@/components/sections/Stats";
import HowWeWork from "@/components/sections/HowWeWork";
import SelectedWork from "@/components/sections/SelectedWork";
import WhyTaskive from "@/components/sections/WhyTaskive";
import Testimonials from "@/components/sections/Testimonials";
import IndustryScroll from "@/components/sections/IndustryScroll";

import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <Industries />
      <Technologies />
      <Stats />
      <HowWeWork />
      <SelectedWork />
      <WhyTaskive />
      <Testimonials />
      <IndustryScroll />

      <FinalCTA />
    </>
  );
}
