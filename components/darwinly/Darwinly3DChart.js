/**
 * Darwinly3DChart - 3D Bar Chart Component
 * 
 * Required packages via npm:
 * - npm install echarts echarts-gl
 * 
 * Or via CDN (add to HTML head):
 * - https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js
 * - https://cdn.jsdelivr.net/npm/echarts-gl@2/dist/echarts-gl.min.js
 */

const SOURCE_COLORS = {
  wikipedia: '#38bdf8', // sky blue
  books: '#6de3b0',     // mint green
  papers: '#a78bfa',    // violet
  movies: '#ffd166',    // yellow
  news: '#ff6b6b',      // coral
}

const SOURCE_NAMES = ['wikipedia', 'books', 'papers', 'movies', 'news']

/**
 * Formats large numbers for axis labels (1.2M, 500K, etc.)
 */
function formatAxisValue(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  return value.toString()
}

/**
 * Extracts all unique years from all sources, sorted
 */
function getYearsRange(sources) {
  const yearsSet = new Set()
  
  Object.values(sources).forEach((items) => {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.year) yearsSet.add(item.year)
      })
    }
  })
  
  return Array.from(yearsSet).sort((a, b) => a - b)
}

/**
 * Builds dataset rows: [[year_string, source_name, count, source_index], ...]
 */
function buildDataset(sources) {
  const years = getYearsRange(sources)
  const rows = []
  
  // For each source, iterate through all years
  SOURCE_NAMES.forEach((sourceName, sourceIndex) => {
    const sourceData = sources[sourceName]
    
    if (!Array.isArray(sourceData)) return
    
    // Create a map for quick lookup
    const yearMap = new Map(sourceData.map((item) => [item.year, item.count]))
    
    // For each year, add a row
    years.forEach((year) => {
      const count = yearMap.get(year) || 0
      rows.push([
        year.toString(),
        sourceName,
        count,
        sourceIndex,
      ])
    })
  })
  
  return { rows, years: years.map((y) => y.toString()) }
}

/**
 * Gets color for a source by its index
 */
function getColorBySourceIndex(sourceIndex) {
  const colors = Object.values(SOURCE_COLORS)
  return colors[sourceIndex] || '#999999'
}

export default class Darwinly3DChart {
  constructor(containerId, data, options = {}) {
    this.containerId = containerId
    this.data = data
    this.options = {
      barSize: 8,
      autoRotate: true,
      rotateSpeed: 4,
      ...options,
    }
    
    this.chart = null
    this.resizeObserver = null
  }
  
  /**
   * Initialize and render the chart
   */
  render() {
    const container = document.getElementById(this.containerId)
    
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`)
      return
    }
    
    // Initialize chart instance
    if (!this.chart) {
      this.chart = window.echarts.init(container, null, { renderer: 'gl' })
    }
    
    // Build chart options
    const chartOptions = this._buildChartOptions()
    this.chart.setOption(chartOptions)
    
    // Setup resize observer
    this._setupResizeObserver(container)
    
    return this
  }
  
  /**
   * Update chart with new data
   */
  update(newData) {
    if (!newData || !newData.sources) {
      console.error('Invalid data format for update')
      return
    }
    
    this.data = newData
    
    if (this.chart) {
      const chartOptions = this._buildChartOptions()
      this.chart.setOption(chartOptions)
    }
    
    return this
  }
  
  /**
   * Destroy chart and cleanup
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  }
  
  /**
   * Build complete chart options
   */
  _buildChartOptions() {
    const { rows, years } = buildDataset(this.data.sources)
    
    return {
      tooltip: {
        formatter: (params) => {
          if (params.componentSubType === 'bar3D') {
            const [year, source, count] = params.value
            return `
              <div style="padding: 8px;">
                <div><strong>${this.data.query}</strong></div>
                <div>Year: ${year}</div>
                <div>Source: <span style="color: ${SOURCE_COLORS[source]}">${source}</span></div>
                <div>Count: <strong>${count.toLocaleString()}</strong></div>
              </div>
            `.trim()
          }
          return ''
        },
      },
      
      grid3D: {
        boxWidth: 200,
        boxDepth: 100,
        boxHeight: 80,
        
        viewControl: {
          autoRotate: this.options.autoRotate,
          autoRotateSpeed: this.options.rotateSpeed,
          alpha: 28,
          beta: -28,
          rotateSensitivity: 1,
        },
        
        postEffect: {
          enable: true,
          bloom: {
            enable: true,
            bloomIntensity: 0.1,
          },
        },
        
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
        
        axisPointer: {
          show: false,
        },
        
        splitLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
      },
      
      xAxis3D: {
        type: 'category',
        data: years,
        axisLabel: {
          fontSize: 10,
          color: '#999',
        },
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
      },
      
      yAxis3D: {
        type: 'category',
        data: SOURCE_NAMES,
        axisLabel: {
          fontSize: 10,
          color: '#999',
        },
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
      },
      
      zAxis3D: {
        type: 'value',
        axisLabel: {
          formatter: (value) => formatAxisValue(value),
          fontSize: 10,
          color: '#999',
        },
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
      },
      
      series: [
        {
          type: 'bar3D',
          data: rows,
          shading: 'lambert',
          label: {
            show: false,
          },
          itemStyle: {
            opacity: 0.85,
            color: (params) => {
              const sourceIndex = params.data[3]
              return getColorBySourceIndex(sourceIndex)
            },
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              color: (params) => {
                const sourceIndex = params.data[3]
                return getColorBySourceIndex(sourceIndex)
              },
            },
          },
          encode: {
            x: 0,
            y: 1,
            z: 2,
          },
        },
      ],
      
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
    }
  }
  
  /**
   * Setup ResizeObserver for responsive behavior
   */
  _setupResizeObserver(container) {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize()
      }
    })
    
    this.resizeObserver.observe(container)
  }
}
