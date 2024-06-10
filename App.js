import React, { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';
import { Sortable } from 'sortablejs';
import LeaderLine from 'react-leader-line';

const App = () => {
  const leftList = useRef(null);
  const rightList = useRef(null);
  const lines = useRef([]);
  let startElement = null;

  const [isScrolling, setIsScrolling] = useState(false);
  const [checkedIds, setCheckedIds] = useState({});

  const isElementInViewport = (el, container) => {
    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
    );
  };

  const updateLines = useCallback(() => {
    const wrapper = document.querySelector('.wrapper');
    const leftContainer = leftList.current;
    const rightContainer = rightList.current;
    lines.current.forEach((line) => {
      const { startId, endId } = line;
      const start = document.querySelector(`[data-id="${startId}"]`);
      const end = document.querySelector(`[data-id="${endId}"]`);
      if (start && end) {
        const startInViewport = isElementInViewport(start, leftContainer) && isElementInViewport(start, wrapper);
        const endInViewport = isElementInViewport(end, rightContainer) && isElementInViewport(end, wrapper);
        if (startInViewport && endInViewport) {
          line.line.show();
          line.line.position();
        } else {
          line.line.hide();
        }
      }
    });
  }, []);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleScroll = debounce(() => {
    setIsScrolling(true);
    updateLines();
    setTimeout(() => {
      setIsScrolling(false);
      lines.current.forEach((line) => {
        line.line.hide();
      });
    }, 1); // Adjust the delay time here (in milliseconds)
  }, 1);
  

  const logLineCreation = (startId, endId) => {
    console.log(`New LeaderLine created from ${startId} to ${endId}`);
  };

  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'yellow', 'gray', 'cyan'];
  const startIdToColor = {};

  useEffect(() => {
    Sortable.create(leftList.current, {
      animation: 50,
      handle: '.variable',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onUpdate: updateLines,
    });

    Sortable.create(rightList.current, {
      animation: 150,
      handle: '.variable',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onUpdate: updateLines,
    });

    const wrapper = document.querySelector('.wrapper');
    wrapper.addEventListener('scroll', handleScroll);

    return () => {
      wrapper.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateLines]);

  useEffect(() => {
    updateLines();

    const scrollContainer = document.querySelector('.scrollable-container');
    scrollContainer.addEventListener('scroll', handleScroll);

    const leftContainer = leftList.current;
    const rightContainer = rightList.current;
    leftContainer.addEventListener('scroll', handleScroll);
    rightContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      leftContainer.removeEventListener('scroll', handleScroll);
      rightContainer.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateLines]);

  const handleLeftButtonClick = (id) => {
    startElement = leftList.current.querySelector(`[data-id="${id}"]`);
  };

  const handleRightButtonClick = (id) => {
    const endElement = rightList.current.querySelector(`[data-id="${id}"]`);
    if (startElement && endElement) {
      const startId = startElement.getAttribute('data-id');
      const endId = endElement.getAttribute('data-id');
      if (!startIdToColor[startId]) {
        startIdToColor[startId] = colors[Object.keys(startIdToColor).length % colors.length];
      }
      const lineColor = startIdToColor[startId];
      const line = new LeaderLine(startElement, endElement, { color: lineColor, size: 2, startPlug: 'disc', endPlug: 'disc', dropShadow: true });
      lines.current.push({ line, startId, endId });
      logLineCreation(startId, endId); // Log the creation of the new LeaderLine
      updateLines();
    }
    startElement = null;
  };

  const handleHideButtonClick = () => {
    lines.current.forEach((line) => {
      line.line.hide();
    });
  };

  const handleShowButtonClick = () => {
    updateLines();
  };

  const handleCheckboxChange = (id) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="wrapper">
      <div className="outer-container">
        <div className="scrollable-container">
          <div className={`container ${isScrolling ? 'scrolling' : ''}`}>
            <div className={`left-container ${isScrolling ? 'small' : ''}`} ref={leftList}>
              {[...Array(10).keys()].map((index) => (
                <div
                  key={`left-${index + 1}`}
                  className="variable"
                  data-id={`left-${index + 1}`}
                  onClick={() => handleLeftButtonClick(`left-${index + 1}`)}
                >
                  {`Left ${index + 1}`}
                </div>
              ))}
            </div>
            <div className={`right-container ${isScrolling ? 'small' : ''}`} ref={rightList}>
              {[...Array(10).keys()].map((index) => (
                <div
                  key={`right-${index + 1}`}
                  className="variable"
                  data-id={`right-${index + 1}`}
                  onClick={() => handleRightButtonClick(`right-${index + 1}`)}
                >
                  {`Right ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="extra-content">
          <button onClick={handleHideButtonClick}>Hide Lines</button>
          <button onClick={handleShowButtonClick}>Show Lines</button>
          <h2>Additional Content</h2>
          <p>This section contains some additional content for demonstration purposes. You can add any content you like here.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
          <p>More text here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, urna eu tincidunt consectetur, nisi nisl aliquet nisi, a convallis tortor felis eu risus.</p>
        </div>
        
        <div className="checkbox-section">
          <h3>Select Left IDs to Display Connections</h3>
          {[...Array(10).keys()].map((index) => {
            const leftId = `left-${index + 1}`;
            return (
              <div key={`checkbox-${index + 1}`} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={!!checkedIds[leftId]}
                  onChange={() => handleCheckboxChange(leftId)}
                />
                <label>{`Left ${index + 1} is connected to`}</label>
                {checkedIds[leftId] && (
                  <span className="connection-text">
                    {lines.current
                      .filter((line) => line.startId === leftId)
                      .map((line) => line.endId)
                      .join(', ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
