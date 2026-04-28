import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import InsightCard from './InsightCard';

const { width } = Dimensions.get('window');

const PolarAreaChart = ({ tags }) => {
  const size = width - 40;
  const center = size / 2;

  // padding reduced to 40 to give words a bit of room if they go over the edge
  const maxChartRadius = size / 2 - 40;
  const innerRadius = 20;

  if (!tags || tags.length === 0) return null;

  const maxCount = Math.max(...tags.map(t => t.count), 1);
  const angleStep = (2 * Math.PI) / tags.length;

  const rainbow = [
    '#FF6384',
    '#FF9F40',
    '#FFCD56',
    '#4BC0C0',
    '#36A2EB',
    '#c0a4f7',
    '#734292',
  ];
  const rainbowDark = [
    '#C62828',
    '#E65100',
    '#FBC02D',
    '#00796B',
    '#1976D2',
    '#6d28f7',
    '#3f0464',
  ];

  const createWedgePath = (startAngle, endAngle, currentRadius) => {
    const x1 = innerRadius * Math.cos(startAngle);
    const y1 = innerRadius * Math.sin(startAngle);
    const x2 = currentRadius * Math.cos(startAngle);
    const y2 = currentRadius * Math.sin(startAngle);
    const x3 = currentRadius * Math.cos(endAngle);
    const y3 = currentRadius * Math.sin(endAngle);
    const x4 = innerRadius * Math.cos(endAngle);
    const y4 = innerRadius * Math.sin(endAngle);
    return `M ${x1} ${y1} L ${x2} ${y2} A ${currentRadius} ${currentRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
  };

  return (
    <InsightCard title="Observation Category Profile">
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Defs>
            {rainbow.map((color, i) => (
              <RadialGradient
                key={`grad-${i}`}
                id={`grad-${i}`}
                cx="0"
                cy="0"
                rx={maxChartRadius + innerRadius}
                ry={maxChartRadius + innerRadius}
                fx="0"
                fy="0"
                gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor={rainbowDark[i]} stopOpacity="1" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.9" />
              </RadialGradient>
            ))}
          </Defs>

          <G x={center} y={center}>
            {[0.25, 0.5, 0.75, 1].map((p, i) => (
              <Circle
                key={i}
                r={innerRadius + maxChartRadius * p}
                stroke="#eee"
                fill="transparent"
              />
            ))}

            {tags.map((item, index) => {
              const startAngle = index * angleStep - Math.PI / 2;
              const endAngle = (index + 1) * angleStep - Math.PI / 2;
              const currentRadius =
                innerRadius + (item.count / maxCount) * maxChartRadius;

              const middleAngle = startAngle + angleStep / 2;

              // FIX: Use a FIXED radius so labels don't move with the wedge size
              // This puts the labels at the 70% mark of the total chart area
              const labelRadius = innerRadius + maxChartRadius * 0.5;

              const tx = labelRadius * Math.cos(middleAngle);
              const ty = labelRadius * Math.sin(middleAngle);

              let rotation = (middleAngle * 180) / Math.PI;

              // readable flip logic
              if (rotation > 90 || rotation < -90) {
                rotation += 180;
              }

              return (
                <G key={index}>
                  <Path
                    d={createWedgePath(startAngle, endAngle, currentRadius)}
                    fill={`url(#grad-${index % rainbow.length})`}
                    stroke="#fff"
                    strokeWidth="2"
                  />

                  {/* FIXED BLACK LABEL */}
                  <G rotation={rotation} origin={`${tx}, ${ty}`}>
                    <SvgText
                      x={tx}
                      y={ty}
                      fill="black" // Changed to black as requested
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle">
                      {`${item.name} (${item.count})`}
                    </SvgText>
                  </G>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
    </InsightCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default PolarAreaChart;
