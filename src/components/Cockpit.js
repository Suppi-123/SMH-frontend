import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Doughnut } from 'react-chartjs-2';
import Graph from './Graph';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faStop, faPlay } from '@fortawesome/free-solid-svg-icons';

const Gauges = () => {
  const [bendingMoment, setBendingMoment] = useState(0);
  const [torsion, setTorsion] = useState(0);
  const [sensorData, setSensorData] = useState([
    { time_seconds: 0, tension: 0, torsion: 0, bending_moment_y: 0 },
  ]);
  const [isWebSocketRunning, setIsWebSocketRunning] = useState(true);
  const [selectedScaleOption, setSelectedScaleOption] = useState(null);
  const [isScaleOptionsVisible, setIsScaleOptionsVisible] = useState(false);
  const [isSpikeOptionsVisible, setIsSpikeOptionsVisible] = useState(false);
  const bendingMomentLimit = 20000; // Get the limit from settings
  const torsionLimit = 5000; // Get the limit from settings

  const [bendingMomentAlarm, setBendingMomentAlarm] = useState({
    enabled: false,
    value: 0,
  });
  const [torsionAlarm, setTorsionAlarm] = useState({
    enabled: false,
    value: 0,
  });

  const handleClearMax = () => {
    window.location.reload();
  };

  const toggleWebSocket = () => {
    setIsWebSocketRunning((prev) => !prev);
  };

  const handleNullify = () => {
    setBendingMoment(0);
    setTorsion(0);
  };

  const handleScaleOptionChange = (option) => {
    setSelectedScaleOption(option);
    setIsScaleOptionsVisible(false);
    // You can perform additional actions based on the selected scale option
  };

  const handleSpikeOptionClick = (option) => {
    // Perform actions based on the selected spike option (e.g., "Wakeup" or "Exit")
    if (option === 'Wakeup') {
      // Implement the logic for wakeup
    } else if (option === 'Exit') {
      // Implement the logic for exit
    }
  };

  useEffect(() => {
    let socket;

    if (isWebSocketRunning) {
      // Establish WebSocket connection only if it's running
       socket = new WebSocket('ws://192.168.10.238:4321/ws_cockpit');
      //socket = new WebSocket('ws://192.168.137.27:1234/ws_cockpit');
      
    

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
        try {
          const receivedData = JSON.parse(event.data);

          const bendingMoment = parseFloat(receivedData.BendingMoment);
          const torsion = parseFloat(receivedData.Torsion);

          if (!isNaN(bendingMoment) && !isNaN(torsion)) {
            console.log('Bending Moment:', bendingMoment);
            console.log('Torsion:', torsion);

            setBendingMoment(bendingMoment);
            setTorsion(torsion);
          } else {
            console.error('Invalid numeric data received:', receivedData);
          }
        } catch (error) {
          console.error('Error processing WebSocket data:', error);
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
      };

      socket.onclose = (event) => {
        if (event.wasClean) {
          console.log(
            `WebSocket connection closed cleanly, code: ${event.code}, reason: ${event.reason}`
          );
        } else {
          console.error('WebSocket connection abruptly closed');
        }
      };
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [isWebSocketRunning]);

  const getBendingMomentConfig = (value, limit) => {
    const alarmPercentage = bendingMomentAlarm.enabled ? bendingMomentAlarm.value : 0;

    const fillColors = value >= alarmPercentage ? ['#FF0000'] : ['#00FF00'];
    const gradientColors = value >= alarmPercentage ? ['#FF0000', '#FF0000'] : ['#00FF00', '#00FF00'];

    return {
      series: [Math.abs(value)],
      options: {
        chart: {
          height: 250,
          type: 'radialBar',
          offsetY: 0,
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: '#e0e0e0',
              strokeWidth: '97%',
              margin: 5,
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                offsetY: -2,
                fontSize: '22px',
              },
            },
          },
        },
        fill: {
          colors: fillColors,
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: gradientColors,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100],
          },
        },
        markers: {
          lineColor: '#FF0000',
          strokeWidth: 2,
          size: 6,
          shape: 'circle',
          radius: 2,
        },
        stroke: {
          lineCap: 'round',
        },
        yaxis: {
          min: 0,
          max: limit,
          labels: {
            show: false,
          },
        },
      },
    };
  };

  const getTorsionConfig = (value, limit) => {
    const alarmPercentage = torsionAlarm.enabled ? torsionAlarm.value : 0;

    const positiveValue = Math.max(0, value);
    const negativeValue = Math.max(0, -value);
    const total = positiveValue + negativeValue;

    const backgroundColors = value >= alarmPercentage ? ['#FF0000', 'transparent'] : ['transparent', '#00FF00'];
    const hoverBackgroundColors = value >= alarmPercentage ? ['#FF0000', 'transparent'] : ['transparent', '#00FF00'];

    return {
      datasets: [
        {
          data: [total / 2, total / 2],
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverBackgroundColors,
          borderWidth: 0,
        },
      ],
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            display: false,
          },
        },
        yaxis: {
          min: 0,
          max: limit,
          labels: {
            show: false,
          },
        },
      },
    };
  };

  return (
    <>
      <div
        className={`overlay ${isWebSocketRunning ? '' : 'show'}`}
        onClick={() => {
          // You can add any custom action on overlay click
          // For example, alert('The WebSocket is stopped. Click Start to resume.');
        }}
      ></div>

      <div className="grid grid-cols-3 gap-4">
        {/* ... (existing buttons) */}

        <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-14">
          <h2 className="text-lg font-bold mb-4">Bending Moment </h2>
          <div style={{ width: '300px', marginLeft: '10px' }}>
            <Chart
              options={getBendingMomentConfig(bendingMoment, bendingMomentLimit).options}
              series={getBendingMomentConfig(bendingMoment, bendingMomentLimit).series}
              type="radialBar"
              height={400}
            />
          </div>
          <p>{`${bendingMoment.toFixed(2)}%`}</p>
        </div>

        <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-14">
          <h2 className="text-lg font-bold mb-4">Spike Polar</h2>
          <div style={{ width: '400px', marginLeft: '10px' }}>
            <Graph />
          </div>
        </div>

        <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-14">
          <h2 className="text-lg font-bold mb-4">Torsion </h2>
          <div style={{ width: '300px', marginLeft: '10px' }}>
            <Doughnut
              data={getTorsionConfig(torsion, torsionLimit)}
              options={getTorsionConfig(torsion, torsionLimit).options}
              height={400}
            />
          </div>
          <p>{`${torsion.toFixed(2)}%`}</p>
        </div>
      </div>
    </>
  );
};

export default Gauges;
