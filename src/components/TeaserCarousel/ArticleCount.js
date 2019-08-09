import { css } from "glamor";
import React from "react";
import { sansSerifRegular18 } from "../Typography/styles";

const ICON_SIZE = 29;

const Icon = ({ size, fill }) => (
  <svg
    {...styles.icon}
    width={`${size}px`}
    height={`${size}px`}
    viewBox={`0 0 30 30`}
  >
    <path
      d="M26.9642857,0 L8.75,0 C7.08035714,0 5.71428571,1.36607143 5.71428571,3.03571429 L5.71428571,21.25 C5.71428571,22.9196429 7.08035714,24.2857143 8.75,24.2857143 L26.9642857,24.2857143 C28.6339286,24.2857143 30,22.9196429 30,21.25 L30,3.03571429 C30,1.36607143 28.6339286,0 26.9642857,0 Z"
      fill={fill}
    />
    <path
      d="M3.03571429,5.71428571 L0,5.71428571 L0,26.9642857 C0,28.6339286 1.36607143,30 3.03571429,30 L24.2857143,30 L24.2857143,26.9642857 L3.03571429,26.9642857 L3.03571429,5.71428571 Z"
      fill={fill}
    />
  </svg>
);

const styles = {
  container: css({
    position: "relative",
    margin: "10px auto",
    width: ICON_SIZE,
    height: ICON_SIZE
  }),
  icon: css({
    position: "absolute",
    top: 0,
    left: 0
  }),
  count: css({
    position: "absolute",
    top: -2,
    left: 0,
    paddingLeft: "6px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...sansSerifRegular18
  })
};

const ArticleCount = ({ count, bgColor = "#FFF", color }) => {
  let countStyles = css(styles.count, { color });
  return (
    <div {...styles.container}>
      <Icon size={ICON_SIZE} fill={bgColor} />
      <span {...countStyles}>{count}</span>
    </div>
  );
};

export default ArticleCount;
