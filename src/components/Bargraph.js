import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const KPIBarGraph = ({ averageTension, averageTorsion, averageBendingMoment }) => {
  const ctx = useRef(null);

  useEffect(() => {
    if (ctx.current) {
        
      const chart = new Chart(ctx.current, {
        type: 'bar',
        data: {
          labels: ['Average Tension', 'Average Torsion', 'Average Bending Moment'],
          datasets: [
            {
              label: 'KPI Values',
              data: [averageTension, averageTorsion, averageBendingMoment],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      return () => chart.destroy(); // Clean up on unmount
    }
  }, [averageTension, averageTorsion, averageBendingMoment]);

  return <canvas ref={ctx} />;
};

export default KPIBarGraph;
