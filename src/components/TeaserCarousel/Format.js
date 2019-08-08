import { css } from "glamor";
import React from "react";
import ChevronRight from "react-icons/lib/md/keyboard-arrow-right";

import { sansSerifRegular22 } from "../Typography/styles";

const styles = {
  label: css({
    display: "inline-block",
    ...sansSerifRegular22,
    margin: "0 0 20px 0"
  }),
  icon: css({
    marginLeft: "8px",
    ...sansSerifRegular22
  })
};

const Format = ({ label }) => {
  return (
    <div {...styles.label}>
      {label}
      <ChevronRight {...styles.icon} size={20} />
    </div>
  );
};

export default Format;
