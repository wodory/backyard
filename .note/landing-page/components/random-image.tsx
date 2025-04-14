"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type BackgroundImage = {
  id: string
  src: string
  alt: string
}

const backgroundImages: BackgroundImage[] = [
  {
    id: "blockchain",
    src: "/images/blockchain-cubes.png",
    alt: "3D blockchain cubes visualization",
  },
  {
    id: "fiber",
    src: "/images/fiber-optic-lights.png",
    alt: "Blue fiber optic lights",
  },
  {
    id: "lightbulb-hands",
    src: "/images/lightbulb-hands.png",
    alt: "Hands holding a light bulb with fairy lights",
  },
  {
    id: "lightbulb-blue",
    src: "/images/lightbulb-blue.png",
    alt: "Light bulb with blue outline against black background",
  },
  {
    id: "lightbulb-sunset",
    src: "/images/lightbulb-sunset.png",
    alt: "Hand holding a light bulb against sunset sky",
  },
]

export default function RandomImage() {
  const [randomImage, setRandomImage] = useState<BackgroundImage | null>(null)

  useEffect(() => {
    // Select a random image on component mount
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setRandomImage(backgroundImages[randomIndex])
  }, [])

  if (!randomImage) {
    return <div className="h-full w-full bg-slate-900" />
  }

  return (
    <div className="relative h-full w-full">
      <Image src={randomImage.src || "/placeholder.svg"} alt={randomImage.alt} fill className="object-cover" priority />
    </div>
  )
}
