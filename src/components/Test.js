import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ScatterGraph from './ScatterGraph';
import { Link } from 'react-router-dom';
import Tiles from './Tiles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const WebSocketComponent = () => {
  const [paused, setPaused] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sensorData, setSensorData] = useState([
  { time_seconds: 0, tension: 0, torsion: 0, bending_moment_y: 0 },
  
]);


const [pausedInterval, setPausedInterval] = useState(null); // Store paused data temporarily

  const chartRefs = useRef({
    tensionChart: null,
    torsionChart: null,
    bendingMomentChart: null,
  });
  const maxDataPoints = 400; // Maximum number of data points to display

  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState('');
  const [recordedLabel, setRecordedLabel] = useState('');
  const [rollingAverageWindowSize, setRollingAverageWindowSize] = useState(1); // Initial window size

  const calculateAverage = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  };

 

  const recordDataPoint = (newSensorData) => {
    const { tension, torsion, bending_moment_y, bending_moment_x, time_seconds, temperature } = newSensorData;
    const timestamp = new Date().toLocaleString(); // Get current timestamp in a human-readable format
    
    // Check for undefined values and skip them
    if (tension !== undefined && torsion !== undefined && bending_moment_y !== undefined && 
        bending_moment_x !== undefined && time_seconds !== undefined && temperature !== undefined) {
      const newDataPoint = `${timestamp};${tension};${torsion};${bending_moment_x};${bending_moment_y};${time_seconds};${temperature}\n`;
      setRecordedData((prevData) => prevData + newDataPoint);
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    const initialData = sensorData.map((data) => {
      const { tension, torsion, bending_moment_y, bending_moment_x, time_seconds, temperature } = data;
      
      // Check for undefined values and skip them
      if (tension !== undefined && torsion !== undefined && bending_moment_y !== undefined && 
          bending_moment_x !== undefined && time_seconds !== undefined && temperature !== undefined) {
        const timestamp = new Date().toLocaleString(); // Get current timestamp in a human-readable format
        return `${timestamp};${tension};${torsion};${bending_moment_x};${bending_moment_y};${time_seconds};${temperature}\n`;
      } else {
        return ''; // Skip undefined values
      }
    });
    setRecordedData(initialData.join('')); // Join the array to form a string
    setRecordedLabel('Date/Time;Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature\n');
  };
  

  const stopRecording = () => {
    setIsRecording(false);
    // Save recorded data as a text file
    const element = document.createElement('a');
    const file = new Blob([recordedLabel + recordedData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recorded_data.txt';
    document.body.appendChild(element);
    element.click();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

    const stopFetching = () => {
      setFetching(false);
    };

    const startFetching = () => {
      setFetching(true);
    };

    const togglePause = () => {
      setPaused((prevPaused) => {
        if (!prevPaused) {
          const interval = setInterval(() => {
            setSensorData((prevData) => [
              ...prevData,
              {
                time_seconds: 0,
                tension: 0,
                torsion: 0,
                bending_moment_y: 0,
              },
            ]);
          }, 1000); // Add null values every second (adjust interval as needed)
          setPausedInterval(interval); // Store interval ID for clearing later
        } else {
          clearInterval(pausedInterval); // Clear the interval when resuming
        }
        return !prevPaused;
      });
    };


  useEffect(() => {
      if (fetching && !paused) {
        //const socket = new WebSocket('ws://192.168.137.27:1234/ws_all_graph_data1');
        const socket = new WebSocket('ws://192.168.137.27:1234/ws_all_graph_data1');
     
    
        socket.onopen = () => {
          console.log('WebSocket connected');
        };
    
        socket.onmessage = (event) => {
          const newSensorData = JSON.parse(event.data);
          setSensorData((prevData) => {
            const updatedData = [...prevData, newSensorData];
            return updatedData.slice(-maxDataPoints);
          });
    
          if (isRecording) {
            recordDataPoint(newSensorData);
          }
      };
    
      return () => {
          socket.close();
      };
    }
  }, [fetching, isRecording, paused,pausedInterval]);

  useEffect(() => {
    if (sensorData.length > 0) {


      
      const timeSeconds = sensorData.map((data) => data.time_seconds);
  
      const calculateRollingAverage = (data, windowSize) => {
        const averages = [];
        for (let i = 0; i < data.length; i++) {
          const start = Math.max(0, i - windowSize);
          const end = i + 1;
          const slice = data.slice(start, end);
          const sum = slice.reduce((acc, curr) => acc + curr, 0);
          const avg = sum / slice.length;
          averages.push(avg);
        }
        return averages;
      };
  
      const updateCharts = (chart, data, rollingAvg) => {
        chart.data.labels = timeSeconds;
        chart.data.datasets[0].data = data;
        chart.data.datasets[1].data = rollingAvg;
        chart.update();
      };

      
  
        // Tension Chart
        if (chartRefs.current.tensionChart) {
          const chart = chartRefs.current.tensionChart;
          const tensionData = sensorData.map((data) => data.tension);
          const tensionRollingAvg = calculateRollingAverage(tensionData, rollingAverageWindowSize);
          updateCharts(chart, tensionData, tensionRollingAvg);
        } else {
          const tensionCtx = document.getElementById('tensionChart').getContext('2d');
          chartRefs.current.tensionChart = new Chart(tensionCtx, {
            type: 'line',
            data: {
              labels: timeSeconds,
              datasets: [
                {
                  label: 'Tension',
                  data: sensorData.map((data) => data.tension),
                  borderColor: 'rgb(75, 192, 192)',
                  borderWidth: 1,
                  fill: false,
                  pointRadius: 0,
                },
                {
                  label: 'Tension Rolling Avg',
                  data: [],
                  borderColor: 'rgb(192, 75, 192)',
                  borderWidth: 1,
                  fill: false,
                  pointRadius: 0,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Tension vs Time (seconds)',
                },
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: false,
                    text: 'Time (seconds)',
                  },
                  ticks: {
                    display: true,
                  },
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Pull/Push[N]',
                  },
                  ticks: {
                    display: true,
                  },
                },
              },
            },
          });
        }
  
      // Torsion Chart
      if (chartRefs.current.torsionChart) {
        const chart = chartRefs.current.torsionChart;
        const torsionData = sensorData.map((data) => data.torsion);
        const torsionRollingAvg = calculateRollingAverage(torsionData, rollingAverageWindowSize);
        updateCharts(chart, torsionData, torsionRollingAvg);
      } else {
        const torsionCtx = document.getElementById('torsionChart').getContext('2d');
        chartRefs.current.torsionChart = new Chart(torsionCtx, {
          type: 'line',
          data: {
            labels: timeSeconds,
            datasets: [
              {
                label: 'Torsion',
                data: sensorData.map((data) => data.torsion),
                borderColor: 'rgb(192, 75, 192)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
              },
              {
                label: 'Torsion Rolling Average',
                data: calculateRollingAverage(sensorData.map((data) => data.torsion), 1),
                borderColor: 'rgb(75, 192, 75)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Torsion vs Time (seconds)',
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: false,
                  text: 'Time (seconds)',
                },
                ticks: {
                  display: true,
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Torsion[NM]',
                },
                ticks: {
                  display: true,
                },
              },
            },
          },
        });
      }
  
      // Bending Moment Chart
      if (chartRefs.current.bendingMomentChart) {
        const chart = chartRefs.current.bendingMomentChart;
        const bendingMomentData = sensorData.map((data) => data.bending_moment_y);
        const bendingMomentRollingAvg = calculateRollingAverage(bendingMomentData, rollingAverageWindowSize);
        updateCharts(chart, bendingMomentData, bendingMomentRollingAvg);
      } else {
        const bendingMomentCtx = document.getElementById('bendingMomentChart').getContext('2d');
        chartRefs.current.bendingMomentChart = new Chart(bendingMomentCtx, {
          type: 'line',
          data: {
            labels: timeSeconds,
            datasets: [
              {
                label: 'Bending Moment',
                data: sensorData.map((data) => data.bending_moment_y),
                borderColor: 'rgb(192, 192, 75)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
              },
              {
                label: 'Bending Moment Rolling Average',
                data: calculateRollingAverage(sensorData.map((data) => data.bending_moment_y), 1),
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Bending Moment vs Time (seconds)',
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: false,
                  text: 'Time (seconds)',
                },
                ticks: {
                  display: true,
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Bending Moment[NM]',
                },
                ticks: {
                  display: true,
                },
              },
            },
          },
        });
      }
    }
  }, [sensorData, rollingAverageWindowSize]);
  
  const increaseRollingAverageWindowSize = () => {
    setRollingAverageWindowSize((prevSize) => prevSize + 1);
  };

  const decreaseRollingAverageWindowSize = () => {
    if (rollingAverageWindowSize > 1) {
      setRollingAverageWindowSize((prevSize) => prevSize - 1);
    }
  };

  // const barGraphData = {
  //   labels: ['Average Tension', 'Average Torsion', 'Average Bending Moment'],
  //   datasets: [
  //     {
  //       label: 'KPIs',
  //       data: [averageTension, averageTorsion, averageBendingMoment],
  //       backgroundColor: [
  //         'rgba(255, 99, 132, 0.2)',
  //         'rgba(54, 162, 235, 0.2)',
  //         'rgba(255, 206, 86, 0.2)',
  //       ],
  //       borderColor: [
  //         'rgba(255, 99, 132, 1)',
  //         'rgba(54, 162, 235, 1)',
  //         'rgba(255, 206, 86, 1)',
  //       ],
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  return (
    <div className='flex flex-row '>

      {/* Filter Button */}
      <div className='absolute top-10 right-6 mt-2'>
      {/* Filter Button */}
      <div className='flex flex-col justify-center items-center ml-2'>
        <div className='mb-2 mt-5'>
          Filter
        </div>
        <div className="flex items-center">
          <button
            onClick={decreaseRollingAverageWindowSize}
            className='bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-l-full'
          >
            -
          </button>
          <div
            contentEditable
            onBlur={(e) => {
              const value = parseInt(e.target.textContent);
              if (!isNaN(value)) {
                setRollingAverageWindowSize(value);
              }
            }}
            className="text-center w-16 h-10 border border-gray-300 rounded-md p-2 outline-none"
          >
            {rollingAverageWindowSize}
          </div>
          <button
            onClick={increaseRollingAverageWindowSize}
            className='bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-r-full'
          >
            +
          </button>
        </div>
      </div>
    </div>

 <button
        className={` mt-11 border-2 border-slate-500 px-2 py-1 absolute top-4 left-4 z-10 bg-white text-base 
                    cursor-pointer rounded-lg ${fetching ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}
        onClick={fetching ? stopFetching : startFetching}
      >
        <span className="mr-2">
        <FontAwesomeIcon icon={faPlay} style={{ color: '#32BBFF' }} />
        </span>
        Stop
      </button>

      <button
        onClick={toggleRecording}
        className={`mt-11 ml-4 border-2 border-slate-500 px-2 py-1 absolute top-4 left-20 z-10 bg-white text-base 
                    cursor-pointer rounded-lg ${isRecording ? 'bg-white' : 'bg-gray-200'} hover:bg-gray-300`}
      >
        {isRecording ? (
          <span>
            <FontAwesomeIcon icon={faVideo} style={{ color: 'red' }} /> Stop Recording
          </span>
        ) : (
          <span>
            <FontAwesomeIcon icon={faVideo} style={{ color: '#32BBFF' }} /> Start Recording
          </span>
        )}
      </button>

      {/* Button to pause/resume data */}
      <button
        onClick={togglePause}
        className={`mt-11 ml-36 border-2 border-slate-500 px-2 py-1 absolute top-4 left-28 z-10 bg-white text-base 
                    cursor-pointer rounded-lg hover:bg-gray-300`}
      >
          <span>
          <FontAwesomeIcon icon={faBullseye} style={{color: "#41b4fb",}}/>
          </span>
        {paused ? 'Null' : 'Null'}
      </button>

  
      <div className='flex flex-col align-bottom mt-8'>
        <div className=''>
          <Tiles />
        </div>
  
        <div className='ml-2 w-3/4'>
          <ScatterGraph fetching={fetching}/>
        </div>
      </div>
     
      
    

       {/* Display KPIs
       <div className='flex flex-col items-center mt-8 ml-2'>
        <div className='mb-2'>KPIs</div>
        <div className='flex flex-col items-center'>
          <div className='flex items-center'>
            <div className='mr-2'>Average Tension:</div>
            <div>{averageTension.toFixed(2)}</div>
          </div>
          <div className='flex items-center'>
            <div className='mr-2'>Average Torsion:</div>
            <div>{averageTorsion.toFixed(2)}</div>
          </div>
          <div className='flex items-center'>
            <div className='mr-2'>Average Bending Moment:</div>
            <div>{averageBendingMoment.toFixed(2)}</div>
          </div>
        </div>
      </div> */}

      
  
      <div className='ml-2 flex flex-col mt-4'>
        <div className=''>
          <div>
            <canvas id="tensionChart" width="1200px" height="250"></canvas>
          </div>
          <div>
            <canvas id="torsionChart" width="1200px" height="250"></canvas>
          </div>
          <div>
            <canvas id="bendingMomentChart" width="1200px" height="250"></canvas>
          </div>
        </div>
      </div>
      {/* <Bargraph
     averageTension={averageTension}
     averageTorsion={averageTorsion}
     averageBendingMoment={averageBendingMoment}
   /> */}
   <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%" }}>
  {/* <Link to="/Kpi">
    <button
      className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-1 px-1"
      // disabled={!registerData}
    >
      Next
    </button>
  </Link> */}
</div>


    </div>
  ); 
};
export default WebSocketComponent;