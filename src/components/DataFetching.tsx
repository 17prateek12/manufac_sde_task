import React, { useState, useEffect } from 'react';
import { Table } from '@mantine/core';

interface CropData {
  Country: string;
  Year: string;
  "Crop Name": string;
  "Crop Production (UOM:t(Tonnes))": string;
  "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": string;
  "Area Under Cultivation (UOM:Ha(Hectares))": string;
}

// Define the type for aggregated data
interface Table1Data {
  Year: string;
  MaxProductionCrop: string;
  MinProductionCrop: string;
}

interface Table2Data {
  Crop: string;
  AverageYield: number;
  AverageArea: number;
}

const DataFetching: React.FC = () => {
  const [data, setData] = useState<CropData[]>([]);
  const [table1, setTable1] = useState<Table1Data[]>([]);
  const [table2, setTable2] = useState<Table2Data[]>([]);

  useEffect(() => {
    fetch('/Manufac_IndiaAgroDataset.json')
      .then((res) => res.json())
      .then((responseJson) => {
        setData(responseJson);
        processData(responseJson);
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }, []);

  const processData = (data: CropData[]) => {
    const yearData: { [key: string]: CropData[] } = {};
    const cropData: { [key: string]: { totalYield: number, totalArea: number, count: number } } = {};

    // Organize data by year and crop
    data.forEach((item) => {
      const year = item.Year.match(/\d{4}/)?.[0] ?? '';
      const cropName = item["Crop Name"];
      const production = parseFloat(item["Crop Production (UOM:t(Tonnes))"]) || 0;
      const yieldValue = parseFloat(item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]) || 0;
      const area = parseFloat(item["Area Under Cultivation (UOM:Ha(Hectares))"]) || 0;

      if (!yearData[year]) {
        yearData[year] = [];
      }
      yearData[year].push({ ...item, "Crop Production (UOM:t(Tonnes))": production.toString() });

      if (!cropData[cropName]) {
        cropData[cropName] = { totalYield: 0, totalArea: 0, count: 0 };
      }
      cropData[cropName].totalYield += yieldValue;
      cropData[cropName].totalArea += area;
      cropData[cropName].count += 1;
    });

    // Create Table 1
    const table1Data: Table1Data[] = Object.keys(yearData).map((year) => {
      const crops = yearData[year];
      const maxCrop = crops.reduce((prev, curr) =>
        parseFloat(curr["Crop Production (UOM:t(Tonnes))"]) > parseFloat(prev["Crop Production (UOM:t(Tonnes))"]) ? curr : prev
      );
      const minCrop = crops.reduce((prev, curr) =>
        parseFloat(curr["Crop Production (UOM:t(Tonnes))"]) < parseFloat(prev["Crop Production (UOM:t(Tonnes))"]) ? curr : prev
      );
      return {
        Year: year,
        MaxProductionCrop: maxCrop["Crop Name"],
        MinProductionCrop: minCrop["Crop Name"],
      };
    });

    // Create Table 2
    const table2Data: Table2Data[] = Object.keys(cropData).map((crop) => {
      const { totalYield, totalArea, count } = cropData[crop];
      return {
        Crop: crop,
        AverageYield: totalYield / count,
        AverageArea: totalArea / count,
      };
    });

    setTable1(table1Data);
    setTable2(table2Data);
  };

  return (
    <div>
      <h1>Data Fetching</h1>
      <h2>Table 1: Crop with Maximum and Minimum Production by Year</h2>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Year</Table.Th>
            <Table.Th>Crop with Maximum Production</Table.Th>
            <Table.Th>Crop with Minimum Production</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {table1.map((row) => (
            <Table.Tr key={row.Year}>
              <Table.Td>{row.Year}</Table.Td>
              <Table.Td>{row.MaxProductionCrop}</Table.Td>
              <Table.Td>{row.MinProductionCrop}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <h2>Table 2: Average Yield and Cultivation Area of Crops (1950-2020)</h2>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Crop</Table.Th>
            <Table.Th>Average Yield (Kg/Ha)</Table.Th>
            <Table.Th>Average Cultivation Area (Ha)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {table2.map((row) => (
            <Table.Tr key={row.Crop}>
              <Table.Td>{row.Crop}</Table.Td>
              <Table.Td>{row.AverageYield.toFixed(2)}</Table.Td>
              <Table.Td>{row.AverageArea.toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default DataFetching;
