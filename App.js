import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  const [startElement, setStartElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [connections, setConnections] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const connectionsRef = useRef(null);

  useEffect(() => {
    const updateConnections = () => {
      connectionsRef.current.innerHTML = '';

      const createLine = (start, end, isTemp = false) => {
        const line = document.createElement('div');
        line.className = isTemp ? 'connection temp' : 'connection';

        const startRect = start.getBoundingClientRect();
        const endRect = isTemp ? end : end.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2 + window.scrollX;
        const y1 = startRect.top + startRect.height / 2 + window.scrollY;
        const x2 = isTemp ? end.x : endRect.left + endRect.width / 2 + window.scrollX;
        const y2 = isTemp ? end.y : endRect.top + endRect.height / 2 + window.scrollY;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;

        if (!isTemp) {
          const arrow = document.createElement('div');
          arrow.className = 'arrow';
          arrow.style.transform = `rotate(${angle + 90}deg)`; // Ensure the arrow points to the end element
          arrow.style.position = 'absolute';
          arrow.style.right = '0';
          line.appendChild(arrow);
        }

        connectionsRef.current.appendChild(line);
      };

      connections.forEach(({ startElement, endElement }) => {
        createLine(startElement, endElement);
      });

      if (isDragging && startElement) {
        createLine(startElement, mousePosition, true);
      }
    };

    const handleScrollAndResize = () => {
      updateConnections();
      requestAnimationFrame(handleScrollAndResize);
    };

    window.addEventListener('resize', handleScrollAndResize);
    window.addEventListener('scroll', handleScrollAndResize);

    handleScrollAndResize();

    return () => {
      window.removeEventListener('resize', handleScrollAndResize);
      window.removeEventListener('scroll', handleScrollAndResize);
    };
  }, [connections, isDragging, startElement, mousePosition]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isDragging) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isDragging]);

  const handleLeftButtonClick = (event) => {
    setStartElement(event.currentTarget);
    setIsDragging(true);
  };

  const handleRightButtonClick = (event) => {
    if (startElement) {
      setConnections([...connections, { startElement, endElement: event.currentTarget }]);
      setStartElement(null);
      setIsDragging(false);
    }
  };

  const handleMouseUp = (event) => {
    if (isDragging) {
      const rightButtons = document.querySelectorAll('.right .connect-button');
      let isHoveringOverRightButton = false;

      rightButtons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          handleRightButtonClick({ currentTarget: button });
          isHoveringOverRightButton = true;
        }
      });

      if (!isHoveringOverRightButton) {
        setStartElement(null);
        setIsDragging(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const createButtons = (side) => {
    return Array.from({ length: 20 }, (_, index) => (
      <div key={`${side}-${index + 1}`}>
        {side === 'left' ? (
          <>
            {`${side} ${index + 1}`} <button className="button connect-button" onMouseDown={handleLeftButtonClick}></button>
          </>
        ) : (
          <>
            <button className="button connect-button" onMouseDown={handleRightButtonClick}></button> {`${side} ${index + 1}`}
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="App">
      <div className="left">
        <div className="container">
          {createButtons('left')}
        </div>
      </div>
      <div className="right">
        <div className="container">
          {createButtons('right')}
        </div>
      </div>
      <div ref={connectionsRef} className="connections"></div>
    </div>
  );
};

export default App;
