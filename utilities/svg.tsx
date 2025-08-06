import React from "react";
import { SvgXml } from "react-native-svg";
import { nextRight, edit } from "../assets/svg/profileSvg";

const IMAGES = {
  //profile
  nextRight: nextRight,
  edit: edit,
};

export type IconsType =
  | ""
  //profile
  | "nextRight"
  | "edit";

type Props = {
  icon: IconsType;
  width?: number;
  height?: number;
  color?: string;
};

const SvgImage = (props: Props) => {
  const { icon, width = 25, height = 25, color = "transparent" } = props;
  const image = IMAGES[icon];
  if (!image) {
    throw new Error(
      `${icon} svg is not added in IMAGES JSON in path > svgIcons/index.js. Please insert icon`
    );
  }
  return <SvgXml xml={image} width={width} height={height} fill={color} />;
};

export default SvgImage;
