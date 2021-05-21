class Searchable {
  constructor (prependTo, id) {
    this.prependTo = prependTo
    this.id = id

    this.thequery
    this.nodeName
    this.nodeContents = {}
    this.previewUp = 2
    this.previewDown = 6

    $(this.prependTo).prepend(
      $(`
      <div id=${id} style="">
      <div class="button dropdown"> 
      <select id="nodeselector">
      </select>
      </div>
      <input id="searchField">
      <button id="previous">Prev.</button><button id="next">Next\></button><a id="resultCounter"style="color:#ff7f50;  font-weight: bold; background-color: unset !important; padding:3px; text-decoration: none;"></a>
      <span style="*/float: right/*" id="previewBtns">
      <button id="clearSearch" >clear 🞩</button>
      <button id="resetPreview" >⟳</button>
      <button id="expandDown" >expand ▽</button>
      <button id="expandUp" >expand △</button>
      </span>
      <pre id="searchResults" style="padding:0; border:0px; white-space:pre-wrap; */max-height:90em/*"></pre>
      </div>
       `)
    )

    this.$el = $(prependTo)
      .children()
      .first()
    this.text = $(this.$el).text()

    $(this.$el)
      .find('#searchField')
      .attr('autocomplete', 'off')

    $(this.$el)
      .find('#previewBtns')
      .hide()

    $(this.$el)
      .find('#expandDown')
      .on('click', e => {
        this.changePreviewLength(10, 0)
      })

    $(this.$el)
      .find('#expandUp')
      .on('click', e => {
        this.changePreviewLength(0, 10)
      })

    $(this.$el)
      .find('#resetPreview')
      .on('click', e => {
        this.changePreviewLength(-1000000000000000, -10000000000)
      })

    $(this.$el)
      .find('#clearSearch')
      .on('click', e => {
        this.changePreviewLength(-1000000, -100000)
        $(this.$el)
          .find('#searchField')
          .val('')
        this.updateResults()
      })

    $(this.$el)
      .find('#next')
      .on('click', e => {
        this.updateResults('next')
      })

    $(this.$el)
      .find('#previous')
      .on('click', e => {
        this.updateResults('previous')
      })

    $(this.$el)
      .find('#nodeselector')
      .change(() => {
        this.doSearch()
      })

    $(this.$el)
      .find('#searchField')
      .on('keyup', e => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          this.updateResults('next')
        } else {
          this.doSearch()
        }
      })
  }

  AddNodeToSearch (nodeAllData, nodeName) {
    if (this.nodeContents[nodeName]) {
      return
    }

    $(this.$el)
      .find('#nodeselector')
      .append($('<option value="' + nodeName + '">' + nodeName + '</option>'))

    if (typeof nodeAllData == 'object') {
      nodeAllData = JSON.stringify(nodeAllData, null, '\t').replace(
        '\\\r\\\n',
        '\n'
      )
    }
    let nodelines = nodeAllData.split('\n')

    //if((typeof nodeAllData)!="string"){return}
    let node = {
      lines: nodelines,
      curr_index: 0,
      curr_indexes: []
    }
    this.nodeContents[nodeName] = node

   
  }

  addSearchButton(nodeName, appependTo) {
    let searchIcon =
    `<img src="https://image.flaticon.com/icons/png/128/3126/3126554.png" 
  id=${this.id}${nodeName}_searchFocus
  title="search" 
  style="display: inline; height: 1.5em; margin-left:-1.5em; cursor: pointer; opacity: 0.7;">`

  //let nodeID = nodeName.replaceAll('.', '\\.')

  $(appependTo).prepend($(searchIcon))

  $(`#${this.id}${nodeName}_searchFocus`).click(() => {
      this.focusOnSearch(nodeName)
    })
  }

  focusOnSearch (nodeName) {
    $(this.$el).find('#nodeselector').val(nodeName)
    $(this.$el).find('#searchField').focus()
    this.doSearch()
  }

  doSearch () {
    //if(!this.thequery){return}
    this.thequery = $(this.$el)
      .find('#searchField')
      .val()
    this.nodeName = $(this.$el).find('#nodeselector').val()

    let lines = this.nodeContents[this.nodeName]['lines']
    this.nodeContents[this.nodeName]['curr_index'] = 0
    this.nodeContents[this.nodeName]['curr_indexes'] = []

    lines.forEach((line, index) => {
      if (line.match(new RegExp(this.thequery, 'i'))) {
        this.nodeContents[this.nodeName]['curr_indexes'].push(index)
      }
    })

    this.updateResults()
  }

  changePreviewLength (down, up) {
    let currUp = this.previewUp
    let currDown = this.previewDown
    let newUp = currUp + up
    let newDown = currDown + down
    if (newDown < 6) {
      newDown = 6
    }
    if (newUp < 2) {
      newUp = 2
    }
    this.previewUp = newUp
    this.previewDown = newDown
    this.updateResults()
  }

  updateResults (direction) {
    let previewDown = this.previewDown
    let previewUp = this.previewUp

    if (direction == 'next') {
      if (
        this.nodeContents[this.nodeName]['curr_index'] ==
        this.nodeContents[this.nodeName]['curr_indexes'].length - 1
      ) {
        this.nodeContents[this.nodeName]['curr_index'] = 0
      } else {
        this.nodeContents[this.nodeName]['curr_index']++
      }
    } else if (direction == 'previous') {
      if (this.nodeContents[this.nodeName]['curr_index'] == 0) {
        this.nodeContents[this.nodeName]['curr_index'] =
          this.nodeContents[this.nodeName]['curr_indexes'].length - 1
      } else {
        this.nodeContents[this.nodeName]['curr_index']--
      }
    }

    this.thequery = $(this.$el)
      .find('#searchField')
      .val()

    if (this.thequery == '') {
      $(this.$el).find('#previewBtns').hide()
      $(this.$el).find('#searchResults').html('')
      $(this.$el).find('#resultCounter').html('')
      return
    }
    $(this.$el).find('#previewBtns').show()

    this.nodeName = $(this.$el).find('#nodeselector').val()

    let lines = this.nodeContents[this.nodeName]['lines']
    let curr_index = this.nodeContents[this.nodeName]['curr_index']
    let curr_indexes = this.nodeContents[this.nodeName]['curr_indexes']

    let result_line = curr_indexes[curr_index]

    let searchCounterCurrent = parseInt([curr_index]) + 1
    let searchCounterTotal = curr_indexes.length

    $(this.$el).find('#resultCounter').html(searchCounterCurrent + '/' + searchCounterTotal)

    if (searchCounterTotal == 0) {
      $(this.$el).find('#searchResults').html(
        '<a style="color:red; font-width:600">Nothing.</a>'
      )
      $(this.$el).find('#resultCounter').html('-/-')
      return
    }

    let match = lines[result_line].match(new RegExp(this.thequery, 'i'))[0]

    let startLine
    let endLine

    if (result_line - previewUp < 0) {
      startLine = result_line
    } else {
      startLine = result_line - previewUp
    }
    if (result_line + previewDown > lines.length) {
      endLine = lines.length
    } else {
      endLine = result_line + previewDown
    }

    //I will clean this up, honestly

    let resultPreview = []
      .concat(
        lines.slice(startLine, result_line),
        lines[result_line].replaceAll(match, '<u>' + match + '</u>'),
        lines.slice(result_line + 1, endLine)
      )
      .join('\r\n')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll(
        '&lt;u&gt;' + match + '&lt;/u&gt;',
        '<u style="color:red; font-weigh:600">' + match + '</u>'
      )
      .replaceAll(match, '<mark>' + match + '</mark>')

    $(this.$el).find('#searchResults').html(resultPreview)
  }
}

let searchx = new Searchable('#x', 'xSearch')

searchx.AddNodeToSearch(
  `data
  dsfsdfsd
  sdfsdfsdf
  data1
  datadfdsfsdfsd
  dafaafsdfsd
  data
  `,
  `awesomeNode`
)
