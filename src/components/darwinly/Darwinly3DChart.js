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
  wikipedia: '#00A3FF', // vivid blue
  books: '#00C46A',     // vivid green
  papers: '#7A42FF',    // vivid violet
  movies: '#FFB300',    // vivid amber
  news: '#FF3B30',      // vivid red
}

const SOURCE_NAMES = ['wikipedia', 'books', 'papers', 'movies', 'news']
const Z_SCALE_MODES = {
  YEAR_SHARE: 'year_share',
  SOURCE_RELATIVE: 'source_relative',
  SOURCE_LOG_RELATIVE: 'source_log_relative',
  LOG_GLOBAL: 'log_global',
}

const Z_SCALE_META = {
  [Z_SCALE_MODES.YEAR_SHARE]: {
    axisName: 'Year Share % (Z)',
    valueLabel: 'Year Share',
    description: 'Percent of each year total',
  },
  [Z_SCALE_MODES.SOURCE_RELATIVE]: {
    axisName: 'Source Relative % (Z)',
    valueLabel: 'Source Relative',
    description: 'Percent of source peak (all years)',
  },
  [Z_SCALE_MODES.SOURCE_LOG_RELATIVE]: {
    axisName: 'Source Log Relative % (Z)',
    valueLabel: 'Source Log Relative',
    description: 'Log-scaled against source peak (all years)',
  },
  [Z_SCALE_MODES.LOG_GLOBAL]: {
    axisName: 'Log Index % (Z)',
    valueLabel: 'Log Index',
    description: 'Log-scaled against global max',
  },
}
const SOURCE_LABELS = {
  wikipedia: 'Wikipedia',
  books: 'Books',
  papers: 'Papers',
  movies: 'Movies',
  news: 'News',
}

function getSourceLabel(sourceKey) {
  return SOURCE_LABELS[sourceKey] || sourceKey
}

function getScaleMeta(scaleMode) {
  return Z_SCALE_META[scaleMode] || Z_SCALE_META[Z_SCALE_MODES.SOURCE_RELATIVE]
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
 * Builds dataset rows with configurable normalization:
 * [[year, source, z_value, source_index, raw_count, year_total, source_max, year_share], ...]
 */
function buildDataset(sources, scaleMode) {
  const years = getYearsRange(sources)
  const rows = []
  const yearTotals = new Map(years.map((year) => [year, 0]))
  const sourceMaxMap = new Map(SOURCE_NAMES.map((source) => [source, 0]))

  SOURCE_NAMES.forEach((sourceName) => {
    const sourceData = sources[sourceName]
    if (!Array.isArray(sourceData)) return

    sourceData.forEach((item) => {
      if (!yearTotals.has(item.year)) return
      yearTotals.set(item.year, (yearTotals.get(item.year) || 0) + (item.count || 0))

      const sourceMax = sourceMaxMap.get(sourceName) || 0
      sourceMaxMap.set(sourceName, Math.max(sourceMax, item.count || 0))
    })
  })

  const globalMax = Math.max(...Array.from(sourceMaxMap.values()), 1)
  const globalLogMax = Math.log10(globalMax + 1)
  
  // For each source, iterate through all years
  SOURCE_NAMES.forEach((sourceName, sourceIndex) => {
    const sourceData = sources[sourceName]
    
    if (!Array.isArray(sourceData)) return
    
    // Create a map for quick lookup
    const yearMap = new Map(sourceData.map((item) => [item.year, item.count]))
    
    // For each year, add a row
    years.forEach((year) => {
      const count = yearMap.get(year) || 0
      const yearTotal = yearTotals.get(year) || 0
      const sourceMax = sourceMaxMap.get(sourceName) || 0
      const yearShare = yearTotal > 0 ? (count / yearTotal) * 100 : 0
      const sourceRelative = sourceMax > 0 ? (count / sourceMax) * 100 : 0
      const sourceLogRelative = sourceMax > 0
        ? (Math.log10(count + 1) / Math.log10(sourceMax + 1)) * 100
        : 0
      const logGlobal = globalLogMax > 0 ? (Math.log10(count + 1) / globalLogMax) * 100 : 0

      let zValue = sourceRelative
      if (scaleMode === Z_SCALE_MODES.YEAR_SHARE) {
        zValue = yearShare
      }
      if (scaleMode === Z_SCALE_MODES.SOURCE_LOG_RELATIVE) {
        zValue = sourceLogRelative
      }
      if (scaleMode === Z_SCALE_MODES.LOG_GLOBAL) {
        zValue = logGlobal
      }

      rows.push([
        year.toString(),
        sourceName,
        zValue,
        sourceIndex,
        count,
        yearTotal,
        sourceMax,
        yearShare,
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

function blendHexColor(hexColor, targetHex, ratio) {
  const safeRatio = Math.max(0, Math.min(1, ratio))
  const hex = hexColor.replace('#', '')
  const target = targetHex.replace('#', '')

  if (hex.length !== 6 || target.length !== 6) {
    return hexColor
  }

  const r = Math.round(parseInt(hex.slice(0, 2), 16) * (1 - safeRatio) + parseInt(target.slice(0, 2), 16) * safeRatio)
  const g = Math.round(parseInt(hex.slice(2, 4), 16) * (1 - safeRatio) + parseInt(target.slice(2, 4), 16) * safeRatio)
  const b = Math.round(parseInt(hex.slice(4, 6), 16) * (1 - safeRatio) + parseInt(target.slice(4, 6), 16) * safeRatio)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getBarBorderColor(sourceIndex, state = 'normal') {
  const baseColor = getColorBySourceIndex(sourceIndex)

  if (state === 'emphasis') {
    return blendHexColor(baseColor, '#ffffff', 0.25)
  }

  return blendHexColor(baseColor, '#000000', 0.4)
}

export default class Darwinly3DChart {
  constructor(containerId, data, options = {}) {
    this.containerId = containerId
    this.data = data
    this.options = {
      barSize: 8,
      autoRotate: true,
      rotateSpeed: 4,
      zScaleMode: Z_SCALE_MODES.SOURCE_LOG_RELATIVE,
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
    const { rows, years } = buildDataset(this.data.sources, this.options.zScaleMode)
    const scaleMeta = getScaleMeta(this.options.zScaleMode)
    
    return {
      tooltip: {
        formatter: (params) => {
          if (params.componentSubType === 'bar3D') {
            const [year, source, zValue, , rawCount, yearTotal, sourceMax, yearShare] = params.value
            return `
              <div style="padding: 10px; font-size: 13px; line-height: 1.45;">
                <div><strong>${this.data.query}</strong></div>
                <div>Year (X): ${year}</div>
                <div>Source (Y): <span style="color: ${SOURCE_COLORS[source]}">${getSourceLabel(source)}</span></div>
                <div>${scaleMeta.valueLabel} (Z): <strong>${zValue.toFixed(2)}%</strong></div>
                <div>Year Share: <strong>${yearShare.toFixed(2)}%</strong></div>
                <div>Count: <strong>${rawCount.toLocaleString()}</strong></div>
                <div>Year Total: <strong>${yearTotal.toLocaleString()}</strong></div>
                <div>Source Peak: <strong>${sourceMax.toLocaleString()}</strong></div>
                <div style="margin-top:6px;color:#a6a6ba;font-size:12px;">Scale: ${scaleMeta.description}</div>
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
            bloomIntensity: 0.03,
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
          show: false,
        },
      },
      
      xAxis3D: {
        type: 'category',
        data: years,
        name: 'Year (X)',
        nameGap: 18,
        nameTextStyle: {
          color: '#a6a6ba',
          fontSize: 13,
        },
        axisLabel: {
          fontSize: 12,
          color: '#999',
        },
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
        splitLine: {
          show: false,
        },
        splitArea: {
          show: false,
        },
      },
      
      yAxis3D: {
        type: 'category',
        data: SOURCE_NAMES,
        name: 'Source (Y)',
        nameGap: 18,
        nameTextStyle: {
          color: '#a6a6ba',
          fontSize: 13,
        },
        axisLabel: {
          fontSize: 12,
          color: '#999',
          formatter: (value) => getSourceLabel(value),
        },
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
        splitLine: {
          show: false,
        },
        splitArea: {
          show: false,
        },
      },
      
      zAxis3D: {
        type: 'value',
        name: scaleMeta.axisName,
        nameGap: 20,
        nameTextStyle: {
          color: '#a6a6ba',
          fontSize: 13,
        },
        axisLabel: {
          formatter: (value) => `${value}%`,
          fontSize: 12,
          color: '#999',
        },
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#2a2a44',
          },
        },
        splitLine: {
          show: false,
        },
        splitArea: {
          show: false,
        },
      },
      
      series: [
        {
          type: 'bar3D',
          data: rows,
          shading: 'color',
          label: {
            show: false,
          },
          itemStyle: {
            opacity: 1,
            borderWidth: 2.2,
            borderColor: (params) => {
              const sourceIndex = params.data[3]
              return getBarBorderColor(sourceIndex, 'normal')
            },
            color: (params) => {
              const sourceIndex = params.data[3]
              return getColorBySourceIndex(sourceIndex)
            },
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              borderWidth: 2.8,
              borderColor: (params) => {
                const sourceIndex = params.data[3]
                return getBarBorderColor(sourceIndex, 'emphasis')
              },
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
