import React from "react";
import { css } from "glamor";
import { mUp } from "../TeaserFront/mediaQueries";
import { sansSerifRegular22, sansSerifMedium20 } from "../Typography/styles";
import ChevronRight from "react-icons/lib/fa/chevron-right";

const styles = {
  tag: css({
    display: "inline-block",
    ...sansSerifRegular22,
    margin: "0 0 20px 0"
  }),
  icon: css({
    marginLeft: "8px",
    ...sansSerifRegular22
  })
};

const Tag = ({ tag }) => {
  return (
    <div {...styles.tag}>
      {tag}
      <ChevronRight {...styles.icon} size={20} />
    </div>
  );
};

export default Tag;
