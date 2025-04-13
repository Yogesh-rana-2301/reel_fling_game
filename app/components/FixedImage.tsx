"use client";

import React from "react";
import NextImage, { ImageProps } from "next/image";

/**
 * A wrapper around Next.js Image component
 */
const FixedImage = (props: ImageProps) => {
  return <NextImage {...props} />;
};

export default FixedImage;
