import { css } from "glamor";
import React from "react";
import { breakoutUp } from "../Center";
import { FigureByline, FigureImage } from "../Figure";
import LazyLoad from "../LazyLoad";
import { mUp } from "../TeaserFront/mediaQueries";
import Text from "../TeaserFront/Text";
import colors from "../../theme/colors";

const IMAGE_SIZE = {
  small: 220,
  medium: 300,
  large: 360
};

const sizeSmall = {
  maxHeight: `${IMAGE_SIZE.small}px`,
  maxWidth: `${IMAGE_SIZE.small}px`
};

const sizeMedium = {
  maxHeight: `${IMAGE_SIZE.medium}px`,
  maxWidth: `${IMAGE_SIZE.medium}px`
};

const sizeLarge = {
  maxHeight: `${IMAGE_SIZE.large}px`,
  maxWidth: `${IMAGE_SIZE.large}px`
};

const styles = {
  carousel: css({
    margin: 0,
    padding: "0 15px",
    border: "1px solid green" // Delete
  }),

  carouselRow: css({
    margin: 0,
    display: "flex",
    flexDirection: "row",
    overflowX: "scroll",
    flexWrap: "nowrap",
    border: "1px solid pink" // Delete
  }),

  tile: css({
    margin: "0 7px 0 0",
    textAlign: "center",
    padding: "30px 15px 40px 15px",
    minWidth: "300px",
    border: `1px solid ${colors.outline}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":last-of-type": { margin: 0 }
  }),

  container: css({
    margin: "auto"
  }),

  imageContainer: css({
    margin: "0 auto 14px auto",
    [mUp]: {
      fontSize: 0 // Removes the small flexbox space.
    }
  }),
  image: css({
    minWidth: "100px",
    ...sizeSmall,
    [mUp]: {
      ...sizeMedium
    },
    [breakoutUp]: {
      ...sizeLarge
    }
  })
};

export const TeaserFrontCarousel = ({ bgColor, color, section, children }) => {
  // console.log(React.Children.count(children));

  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor ? bgColor : "none",
    color: color ? color : "inherit"
  });

  return (
    <section {...customStyles}>
      {section}
      <div role="group" {...styles.carouselRow}>
        {children}
      </div>
    </section>
  );
};

const TeaserFrontCarouselTile = ({
  children,
  attributes,
  image,
  // byline,
  alt,
  onClick,
  color,
  bgColor,
  align,
  aboveTheFold
}) => {
  const background = bgColor || "";
  const justifyContent =
    align === "top" ? "flex-start" : align === "bottom" ? "flex-end" : "";
  const imageProps =
    image && FigureImage.utils.getResizedSrcs(image, IMAGE_SIZE.large, false);
  let tileStyle = {
    background,
    cursor: onClick ? "pointer" : "default",
    justifyContent
  };

  return (
    <div
      {...attributes}
      {...styles.tile}
      onClick={onClick}
      style={tileStyle}
      className="tile"
    >
      <div {...styles.container}>
        {/* Image */}
        {imageProps && (
          <div {...styles.imageContainer}>
            <LazyLoad
              visible={aboveTheFold}
              style={{ position: "relative", fontSize: 0 }}
            >
              <img
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                alt={alt}
                {...styles.image}
              />
              {/* {byline && (
              <FigureByline position="rightCompact" style={{ color }}>
                {byline}
              </FigureByline>
            )} */}
            </LazyLoad>
          </div>
        )}
        {/* Body */}
        <div {...styles.textContainer}>
          <Text color={color} maxWidth={"600px"} margin={"0 auto"}>
            {children}
          </Text>
        </div>
      </div>
    </div>
  );
};
export default TeaserFrontCarouselTile;
