import React from 'react'

/**
 * const [ref, { width, height }] = useSize()
 * <div ref={ref} />
 */
export const useSize = () => {
  const ro = React.useRef();
  const [size, setSize] = React.useState({});

  return [
    React.useCallback(el => {
      if (!ro.current) {
        // eslint-disable-next-line
        ro.current = new ResizeObserver(entries => {
          setSize({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height
          });
        });
      }

      if (el) {
        ro.current.observe(el);
      } else {
        ro.current.disconnect();
      }
    }, []),
    size
  ];
};
