"use client";

import { cn } from "@ai/utils/cn";
import { Variants, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { FiCheck } from "react-icons/fi";

export type ImageOption = 1 | 2;

type ImageChoiceProps = {
  imageOption1: { src: string; alt: string };
  imageOption2: { src: string; alt: string };
  selectedImage: ImageOption | undefined;
  setSelectedImage: Dispatch<SetStateAction<ImageOption | undefined>>;
  disabled?: boolean;
};

const ImageChoice = ({
  imageOption1,
  imageOption2,
  selectedImage,
  setSelectedImage,
  disabled,
}: ImageChoiceProps) => {
  const [showImage1, setShowImage1] = useState(false);
  const [showImage2, setShowImage2] = useState(false);

  const bothShown = showImage1 && showImage2;

  useEffect(() => {
    if (!imageOption1) {
      setShowImage1(false);
    }
    if (!imageOption2) {
      setShowImage2(false);
    }
  }, [imageOption1, imageOption2]);

  const image1Variants: Variants = {
    hidden: {
      opacity: 0,
      y: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };
  const image2Variants: Variants = {
    hidden: {
      opacity: 0,
      y: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
      },
    },
  };

  return (
    <div className="flex gap-6">
      {imageOption1.src && (
        <motion.div
          initial={false}
          animate={bothShown ? "visible" : "hidden"}
          variants={image1Variants}
        >
          <button
            className="relative"
            disabled={disabled ?? !showImage1}
            onClick={() => setSelectedImage(1)}
          >
            <Image
              className={cn(
                `aspect-square rounded-xl transition`,
                selectedImage === 1 && "ring ring-indigo-600"
              )}
              src={imageOption1.src}
              alt={imageOption1.alt}
              onLoad={() => setShowImage1(true)}
              width={1024}
              height={1024}
            />
            <FiCheck
              className={cn(
                "absolute -right-2 -top-2 scale-0 transform rounded-full bg-green-600 p-0.5 text-xl text-white transition",
                selectedImage === 1 && "scale-100"
              )}
            />
          </button>
        </motion.div>
      )}
      {imageOption2.src && (
        <motion.div
          initial={false}
          animate={bothShown ? "visible" : "hidden"}
          variants={image2Variants}
        >
          <button
            className="relative"
            disabled={disabled ?? !showImage2}
            onClick={() => setSelectedImage(2)}
          >
            <Image
              className={cn(
                `aspect-square rounded-xl transition`,
                selectedImage === 2 && "ring ring-indigo-600"
              )}
              src={imageOption2.src}
              alt={imageOption2.alt}
              onLoad={() => setShowImage2(true)}
              width={1024}
              height={1024}
            />
            <FiCheck
              className={cn(
                "absolute -right-2 -top-2 scale-0 transform rounded-full bg-green-600 p-0.5 text-xl text-white transition",
                selectedImage === 2 && "scale-100"
              )}
            />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ImageChoice;
