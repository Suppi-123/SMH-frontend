import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
        y2AxisID: 'right',
        borderAlign: 'center', // Align the border with the center of the data point
      
      },
    ],
  });
 
  

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://192.168.137.120/ws_all_graph_data1');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);

        // Update chart data
        setChartData((prevData) => ({
          ...prevData,
          labels: [...prevData.labels, new Date().toLocaleTimeString()],
          datasets: [
            {
              ...prevData.datasets[0],
              data: [...prevData.datasets[0].data, data.bending_moment_y],
             
            },
            {
              ...prevData.datasets[1],
              data: [...prevData.datasets[1].data, data.torsion],
              
            },
          ],
        }));
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
  }, []);

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    pointRadius:0,
  
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
        
      
    
        y:{
      
          type: 'linear',
          display: true,
          position: 'right',
         
        },
    
    },
        y2:
        {
          type: 'linear',
          display: true,
          position: 'left',
         
        },
      
       
    plugins: {
      datalabels: {
        display: false,
      },
    },
    
  
  };

  return (
    <div style={{ width: '80%', margin: 'auto'}}>
     
      <div style={{ height: '700px' ,marginTop:'100px'}}>
        <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

export default WebSocketGraph;