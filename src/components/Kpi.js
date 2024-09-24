import React from 'react';
import { Bar } from 'react-chartjs-2';

const data = {
  labels: ['Bending moment', 'tension', 'torsion'],
  datasets: [
    {
      label: 'Percentage',
      data: [50, 30, 75], // Update these values as needed
      backgroundColor: (context) => {
        const value = context.dataset.data[context.dataIndex];
        if (value <= 30) {
          return 'green';
        } else if (value > 30 && value <= 60) {
          return 'yellow';
        } else {
          return 'red';
        }
      },
    },
  ],
};

const options = {
  scales: {
    xAxes: [{
      stacked: true,
    }],
    yAxes: [{
      stacked: true,
      ticks: {
        beginAtZero: true,
        callback: function(value) {
          return value + "%";
        },
      },
    }],
  },
};

const StackBarGraph = () => (
  <div style={{height: '500px', width: '700px'}}>
    <Bar data={data} options={options} />
  </div>
);

export default StackBarGraph;
