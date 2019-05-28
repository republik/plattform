import React from 'react'

/**
 * const [ref, { width, height }] = useSize()
 * <div ref={ref} />
 *
 * This hook uses ResizeObserver, make sure you have a polyfill installed if your browser
 * doesn't support it yet.
 *
 * @see useBoundingClientRect(): A hook which doesn't depend on ResizeObserver.
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
