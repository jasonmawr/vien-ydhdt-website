import HeroSection from "@/components/sections/HeroSection";
import FeaturedServices from "@/components/sections/FeaturedServices";
import FeaturedDoctors from "@/components/sections/FeaturedDoctors";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <FeaturedDoctors />
    </>
  );
}
