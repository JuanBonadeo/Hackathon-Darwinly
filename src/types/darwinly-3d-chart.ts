/**
 * Type definitions for Darwinly3DChart component
 */

export interface Darwinly3DChartOptions {
  /** Width/depth of bars in the chart */
  barSize?: number
  /** Enable automatic 3D rotation */
  autoRotate?: boolean
  /** Speed of auto-rotation (1-10) */
  rotateSpeed?: number
}

export interface Darwinly3DChartInstance {
  /** Initialize and render the chart */
  render(): Darwinly3DChartInstance
  
  /** Update chart with new data */
  update(newData: any): Darwinly3DChartInstance
  
  /** Clean up chart and listeners */
  destroy(): void
}

export interface SourceColor {
  [key: string]: string
}

export interface DataPoint {
  year: number
  count: number
}

export interface ChartDataRow {
  0: string // year as string
  1: string // source name
  2: number // count
  3: number // source index
  length: 4
}

export interface Grid3DConfig {
  boxWidth: number
  boxDepth: number
  boxHeight: number
  viewControl?: {
    autoRotate: boolean
    autoRotateSpeed: number
    alpha: number
    beta: number
    rotateSensitivity: number
  }
  postEffect?: {
    enable: boolean
    bloom?: {
      enable: boolean
      bloomIntensity: number
    }
  }
  axisLine?: {
    lineStyle: {
      color: string
    }
  }
  axisPointer?: {
    show: boolean
  }
  splitLine?: {
    lineStyle: {
      color: string
    }
  }
}
