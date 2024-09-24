import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Scatter } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';

const Gauges = () => {
  const [bendingMoment, setBendingMoment] = useState(0);
  const [torsion, setTorsion] = useState(0);
  const [error, setError] = useState(null);
  const [spikeData, setSpikeData] = useState([]);
  const [spikeError, setSpikeError] = useState(null);

  useEffect(() => {
    // Bending Moment and Torsion WebSocket connection
    const socket = new WebSocket('ws://192.168.137.27:1442/ws_cockpit');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data);

        // Extract bending moment and torsion from the received data
        const bendingMoment = parseFloat(receivedData.BendingMoment);
        const torsion = parseFloat(receivedData.Torsion);

        // Check if the extracted values are valid numbers
        if (!isNaN(bendingMoment) && !isNaN(torsion)) {
          console.log('Bending Moment:', bendingMoment);
          console.log('Torsion:', torsion);

          // Set your state variables or perform further actions if needed
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
      setError('WebSocket connection error');
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      setError('WebSocket connection closed');
    };

    // Spike Polar WebSocket connection
    const spikeSocket = new WebSocket('ws://192.168.137.120:1442/ws_spike_polar');

    spikeSocket.onopen = () => {
      console.log('Spike Polar WebSocket connection established');
      setSpikeError(null);
    };

    spikeSocket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data);

        // Process the received data and update the state
        setSpikeData(receivedData);
      } catch (error) {
        console.error('Error processing Spike Polar WebSocket data:', error);
      }
    };

    spikeSocket.onerror = (event) => {
      console.error('Spike Polar WebSocket error:', event);
      setSpikeError('Spike Polar WebSocket connection error');
    };

    spikeSocket.onclose = (event) => {
      console.log('Spike Polar WebSocket connection closed:', event);
      setSpikeError('Spike Polar WebSocket connection closed');
    };

    return () => {
      socket.close();
      spikeSocket.close();
    };
  }, []);

  const getBendingMomentConfig = (value) => {
    const fillColors = value >= 0 ? ['#00FF00'] : ['#FF0000'];
    const gradientColors = value >= 0 ? ['#00FF00', '#00FF00'] : ['#FF0000', '#FF0000'];

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
        labels: [`${value.toFixed(2)}%`],
      },
    };
  };


  const getTorsionConfig = (value) => {
    const positiveValue = Math.max(0, value);
    const negativeValue = Math.max(0, -value);
    const total = positiveValue + negativeValue;
  
    // Dynamically set colors based on the sign of the value
    const backgroundColors = value >= 0 ? ['#00FF00', 'transparent'] : ['transparent', '#FF0000'];
    const hoverBackgroundColors = value >= 0 ? ['#00FF00', 'transparent'] : ['transparent', '#FF0000'];
  
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
        cutout: '70%', // Set cutout to '50%' for a half-doughnut
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };
  };


  
  
  
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-8">
        <h2 className="text-lg font-bold mb-4">Bending Moment </h2>
        <div style={{ width: '300px', marginLeft: '10px' }}>
          <Chart
            options={getBendingMomentConfig(bendingMoment).options}
            series={getBendingMomentConfig(bendingMoment).series}
            type="radialBar"
            height={400}
          />
        </div>
        <p>{`${bendingMoment.toFixed(2)}%`}</p>
      </div>

      <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-8">
        <h2 className="text-lg font-bold mb-4">Spike Polar</h2>
        <div style={{ width: '100%', height: '200px' }}>
          {/* ScatterGraph displayed within Spike Polar */}
          <Scatter
      data={{
        datasets: [
          {
            label: 'Scatter Graph',
            data: spikeData, // Make sure spikeData is an array of { x, y } objects
            backgroundColor: 'rgba(75,192,192,1)',
          },
        ],
      }}
      options={{
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: -100, // Adjust the min and max values as needed
            max: 100,
          },
          y: {
            type: 'linear',
            position: 'left',
            min: -100, // Adjust the min and max values as needed
            max: 100,
          },
        },
      
      }}
    />
  </div>
</div>


  


<div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center mt-8">
        <h2 className="text-lg font-bold mb-4">Torsion </h2>
        <div style={{ width: '300px', marginLeft: '10px' }}>
          <Doughnut
            data={getTorsionConfig(torsion)}
            options={getTorsionConfig(torsion).options}
            height={400}
          />
        </div>
        <p>{`${torsion.toFixed(2)}%`}</p>
      </div>

    </div>
  );
};

export default Gauges;
