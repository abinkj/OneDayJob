import React, { memo } from "react";
import { SvgXml } from "react-native-svg";
import { nextRight, edit } from "../assets/svg/profileSvg";
import {
  postJob,
  home,
  status,
  homeActive,
  statusActive,
  profile,
  profileActive,
  message,
  messageActive,
} from "../assets/svg/tabBarSvg";
const IMAGES = {
  //profile
  nextRight: nextRight,
  edit: edit,

  //tab Icons
  postJob: postJob,
  home: home,
  homeActive: homeActive,
  status: status,
  statusActive: statusActive,
  profile: profile,
  profileActive: profileActive,
  message: message,
  messageActive: messageActive,
};

export type IconsType =
  | ""
  //profile
  | "nextRight"
  | "edit"
  //tab Icons
  | "postJob"
  | "home"
  | "homeActive"
  | "line"
  | "status"
  | "statusActive"
  | "profile"
  | "profileActive"
  | "message"
  | "messageActive";

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

export default memo(SvgImage);
