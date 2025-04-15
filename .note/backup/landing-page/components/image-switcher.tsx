"use client"

import { useState } from "react"

import Image from "next/image"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export default function ImageSwitcher() {
  const [currentImage, setCurrentImage] = useState<BackgroundImage>(backgroundImages[0])

  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <Image
        src={currentImage.src || "/placeholder.svg"}
        alt={currentImage.alt}
        fill
        className="object-cover"
        priority
      />

      {/* Image Switcher Menu */}
      <div className="absolute bottom-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 text-xs font-medium text-muted-foreground">배경 이미지 변경</div>
            {backgroundImages.map((image) => (
              <DropdownMenuItem
                key={image.id}
                onClick={() => setCurrentImage(image)}
                className={`flex items-center gap-2 ${currentImage.id === image.id ? "bg-muted" : ""}`}
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-background">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm">
                  {image.id === "blockchain"
                    ? "블록체인 큐브"
                    : image.id === "fiber"
                      ? "광섬유 조명"
                      : image.id === "lightbulb-hands"
                        ? "전구를 든 손"
                        : image.id === "lightbulb-blue"
                          ? "파란 전구"
                          : "일몰 배경 전구"}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
