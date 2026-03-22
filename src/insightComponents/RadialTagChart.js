import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import InsightCard from './InsightCard';

const { width } = Dimensions.get('window');

const RadialTagChart = ({ tags }) => {
  // 1. Setup Chart Constants
  const size = width - 80;
  const center = size / 2;
  const radius = center - 40; // Max bar length
  const innerRadius = 20; // Empty center hole

  // Colors for your 7 tags
  const rainbow = [
    '#FF6384',
    '#FF9F40',
    '#FFCD56',
    '#4BC0C0',
    '#36A2EB',
    '#9966FF',
    '#C9CBCF',
  ];

  if (!tags || tags.length === 0) return null;

  // Find max value to scale the bars
  const maxVal = Math.max(...tags.map(t => t.count), 1);

  return (
    <InsightCard title="Tag Intensity Profile">
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <G x={center} y={center}>
            {/* Draw Background Circles (Grid) */}
            {[0.25, 0.5, 0.75, 1].map((p, i) => (
              <Circle
                key={i}
                r={innerRadius + radius * p}
                stroke="#E0E0E0"
                fill="none"
                strokeDasharray="4,4"
              />
            ))}

            {tags.map((item, index) => {
              const angle = (index / tags.length) * 2 * Math.PI - Math.PI / 2;
              const barLength = (item.count / maxVal) * radius;

              // Coordinates for the bar
              const x2 = (innerRadius + barLength) * Math.cos(angle);
              const y2 = (innerRadius + barLength) * Math.sin(angle);

              // Coordinates for the label
              const lx = (innerRadius + radius + 15) * Math.cos(angle);
              const ly = (innerRadius + radius + 15) * Math.sin(angle);

              return (
                <G key={index}>
                  {/* The Bar */}
                  <Line
                    x1={innerRadius * Math.cos(angle)}
                    y1={innerRadius * Math.sin(angle)}
                    x2={x2}
                    y2={y2}
                    stroke={rainbow[index % rainbow.length]}
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* The Value Label */}
                  <SvgText
                    x={lx}
                    y={ly}
                    fill="#455A64"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle">
                    {item.count}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>

        {/* Simple Legend below the chart */}
        <View style={styles.legend}>
          {tags.map((item, i) => (
            <View key={i} style={styles.legendItem}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: rainbow[i % rainbow.length] },
                ]}
              />
              <Text style={styles.legendText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </InsightCard>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', margin: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 11, color: '#607D8B' },
});

export default RadialTagChart;
