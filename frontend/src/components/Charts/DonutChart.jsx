import React, { useState, useEffect, useRef } from 'react';

const DonutChart = ({ 
  data,
  title,
  size = 300,
  cutout = '60%',
  colors = ['#000000', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawChart();
  }, [data]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const cutoutRadius = radius * (parseInt(cutout) / 100);
    
    canvas.width = size;
    canvas.height = size;
    
    ctx.clearRect(0, 0, size, size);
    
    if (!data || !data.values) return;
    
    const total = data.values.reduce((sum, val) => sum + val, 0);
    let startAngle = -Math.PI / 2;
    
    data.values.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, cutoutRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    // Draw center text
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, centerX, centerY);
    
    // Draw title
    if (title) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(title, centerX, centerY + 40);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 inline-block">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DonutChart;