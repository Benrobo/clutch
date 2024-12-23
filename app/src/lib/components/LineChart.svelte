<script lang="ts">
  import * as echarts from "echarts";
  import { onMount, afterUpdate } from "svelte";

  type EChartsOption = echarts.EChartsOption;

  export let data: { date: string; value: number }[] = [];

  let myChart: echarts.ECharts;

  function createChart() {
    if (!myChart) {
      let chartDom = document.getElementById("line-chart-main")!;
      myChart = echarts.init(chartDom);
    }

    const xAxisData = data.map((item) => item.date);
    const yAxisData = data.map((item) => item.value);

    const option: EChartsOption = {
      tooltip: {
        // backgroundColor: "rgba(255, 255, 255, 0.5)",
        // borderColor: "#ffffff",
        // borderWidth: 3,
        // borderRadius: 100,
        // extraCssText: "box-shadow: none;",
        trigger: "axis",
        // formatter: function (params: any) {
        //   const param = params[0];
        //   return `<div>
        //     <span style="font-weight:500;color:#000">${dayjs(param.axisValue).format("MMM DD, YYYY")}</span><br />
        //     <span>${param.seriesName}: ${param.value}</span>
        //   </div>`;
        // },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: "#696969",
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: false,
          lineStyle: {
            type: "dashed",
            width: 1.25,
            color: "#E2E2E2",
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#cccccc48",
            width: 3,
          },
        },
        axisLabel: {
          color: "#696969",
        },
      },
      series: [
        {
          name: "Search Volume",
          data: yAxisData,
          type: "line",
          showSymbol: false,
          symbolSize: 9,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#3770fe" },
              { offset: 1, color: "rgba(255, 255, 255, 0.00)" },
            ]),
          },
          itemStyle: {
            color: "#67A2F1",
          },
        },
      ],
    };

    myChart.setOption(option);
  }

  onMount(() => {
    createChart();

    // Resize chart when window size changes
    window.addEventListener("resize", () => myChart?.resize());

    return () => {
      window.removeEventListener("resize", () => myChart?.resize());
      myChart?.dispose();
    };
  });

  afterUpdate(() => {
    createChart();
  });
</script>

<div id="line-chart-main" class="w-full h-[450px] font-poppins"></div>
