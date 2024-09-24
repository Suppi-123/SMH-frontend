import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faStop, faPlay, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const WebSocketGraph = () => {
  const [socket, setSocket] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Bending Moment Y',
        data: [],
        borderColor: ' #000000',
        backgroundColor: ' #000000',
        fill: false,
        yAxisID: 'left',
        borderAlign: 'center', // Align the border with the center of the data point
        
      },
      {
        label: 'Torsion',
        data: [],
        borderColor: '#006312',
        backgroundColor: '#006312',
        fill: false,
        yAxisID: 'right',
        borderAlign: 'center', // Align the border with the center of the data point
      },
      {
        label: 'Bending Moment Y (Rolling Average)',
        data: [],
        borderColor: ' #FF5733',
        backgroundColor: ' #FF5733',
        fill: false,
        yAxisID: 'left',
        borderAlign: 'center', // Align the border with the center of the data point
        hidden: true, // Initially hide the rolling average dataset
      },
      {
        label: 'Torsion (Rolling Average)',
        data: [],
        borderColor: '#ff33dd',
        backgroundColor: '#f133ff',
        fill: false,
         yAxisID: 'right',
        borderAlign: 'center', // Align the border with the center of the data point
        hidden: true, // Initially hide the rolling average dataset
      },
    ],
  });

  const handleNullify = () => {
    setBendingMomentY(0);
    setTorsion(0);
  };

  const toggleWebSocket = () => {
    setIsWebSocketRunning((prev) => !prev);
  };

  const [bendingMomenty, setBendingMomentY] = useState(0);
  const [torsion, setTorsion] = useState(0);
  const [isWebSocketRunning, setIsWebSocketRunning] = useState(true);
  const [rollingAverageWindow, setRollingAverageWindow] = useState(10); // Default window size

  useEffect(() => {
    if (isWebSocketRunning) {
      // Connect to WebSocket
      const ws = new WebSocket('ws://192.168.137.27:1234/ws_all_graph_data1');
      //const ws = new WebSocket('ws://192.168.137.27:1234/ws_all_graph_data1');
      

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received data:', data);

          // Update chart data
          setChartData((prevData) => {
            const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
            const newBendingMomentYData = [...prevData.datasets[0].data, data.bending_moment_y];
            const newTorsionData = [...prevData.datasets[1].data, data.torsion];
            const bendingMomentYRollingAverage = calculateRollingAverage(newBendingMomentYData, rollingAverageWindow);
            const torsionRollingAverage = calculateRollingAverage(newTorsionData, rollingAverageWindow);

            return {
              ...prevData,
              labels: newLabels,
              datasets: [
                {
                  ...prevData.datasets[0],
                  data: newBendingMomentYData,
                },
                {
                  ...prevData.datasets[1],
                  data: newTorsionData,
                },
                {
                  ...prevData.datasets[2],
                  data: bendingMomentYRollingAverage,
                },
                {
                  ...prevData.datasets[3],
                  data: torsionRollingAverage,
                },
              ],
            };
          });
        } catch (error) {
          console.error('Error parsing incoming data:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [isWebSocketRunning]);

  const calculateRollingAverage = (data, windowSize) => {
    if (data.length < windowSize) {
      return data;
    }

    const averages = [];
    for (let i = 0; i < data.length - windowSize + 1; i++) {
      const windowData = data.slice(i, i + windowSize);
      const average = windowData.reduce((sum, value) => sum + value, 0) / windowSize;
      averages.push(average);
    }

    return averages;
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    pointRadius: 0,
    scales: {
      x: {
        type: 'category',
        position: 'top',
        title: {
          display: true,
        },
        ticks: {
          maxTicksLimit: 5,
          
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'right',
      },
      y2: {
        type: 'linear',
        display: false, // Hide the y-axis for 'Bending Moment Y (Rolling Average)' and 'Torsion (Rolling Average)' datasets
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };
  
  const increaseRollingAverageWindow = () => {
    setRollingAverageWindow((prevSize) => prevSize + 1);
  };

  const decreaseRollingAverageWindow = () => {
    if (rollingAverageWindow > 1) {
      setRollingAverageWindow((prevSize) => prevSize - 1);
    }
  };

  return (
    <div style={{ width: '100%', margin: 'auto' }}>
      {/* Start/Stop WebSocket button */}
      <button
        onClick={toggleWebSocket}
        className={`mt-12 ml-30 border-2 border-slate-500 px-2 py-1 absolute top-4 left-50 z-10 bg-white text-base 
                    cursor-pointer rounded-lg hover:bg-gray-300`}
      >
        <span>
          <FontAwesomeIcon icon={isWebSocketRunning ? faStop : faPlay} style={{ color: isWebSocketRunning ? 'red' : 'green' }} />
        </span>
        {isWebSocketRunning ? 'Stop' : 'Stream'}
      </button>


{/* Nullify button */}
<button
  onClick={handleNullify}
  className={`mt-12 ml-40 border-2 border-slate-500 px-2 py-1 absolute top-4 left-40 z-10 bg-white text-base 
              cursor-pointer rounded-lg hover:bg-gray-300`}
>
  Null
</button>

{/* Filter buttons */}
<div className="absolute top-16 right-40 flex items-center">
  <button
    onClick={decreaseRollingAverageWindow}
    className="bg-white text-xxl px-2 py-1 border border-gray-400 rounded-l-lg hover:bg-gray-300"
  >
    <FontAwesomeIcon icon={faMinus} />
  </button>
  <div
    contentEditable
    onBlur={(e) => {
      const value = parseInt(e.target.textContent);
      if (!isNaN(value)) {
        setRollingAverageWindow(value);
      }
    }}
    className="px-3 text-xl border border-gray-500 rounded-md"
    style={{ width: '60px', textAlign: 'center' }}
  >
    {rollingAverageWindow}
  </div>
  <button
    onClick={increaseRollingAverageWindow}
    className="bg-white text-xxl px-2 py-1 border border-gray-400 rounded-r-lg hover:bg-gray-300"
  >
    <FontAwesomeIcon icon={faPlus} />
  </button>
</div>

{/* Chart */}
<div style={{ height: '700px', marginTop: '100px' }}>
  <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
</div>
</div>
);
};

export default WebSocketGraph;
