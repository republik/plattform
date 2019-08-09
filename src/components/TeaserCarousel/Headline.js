import React from "react";
import PropTypes from "prop-types";
import { css } from "glamor";
import { serifBold19 } from "../Typography/styles";

const styles = {
  base: css({
    margin: "0 0 10px 0",
    ...serifBold19
  })
};

const Headline = ({ children }) => {
const Headline = ({ bigger = false, children }) => {
  let headlineStyles = css(
    styles.base,
    bigger ? { ...serifBold28 } : { ...serifBold16 }
  );
  return <h1 {...headlineStyles}>{children}</h1>;
};

Headline.propTypes = {
  children: PropTypes.node
};

export default Headline;
