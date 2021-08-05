let windowId = null;
let selectTypeValue = '';
let ratios = [];

window.onload = function () {
  bindTypeEvent();
  updateWindowSize();

  let Default_RATIOS = [
    [1024, 768],
    [1440, 900],
    [1680, 1050],
    [2560, 1440],
  ];
  // 读取数据，第一个参数是指定要读取的key以及设置默认值
  chrome.storage.sync.get({ ratios: [], type: 'viewport' }, function (args) {
    selectType(args.type);
    console.log(33, args);
    ({ ratios } = args);
    if (ratios.length === 0) {
      ratios = Default_RATIOS;
      // 保存数据
      chrome.storage.sync.set({ ratios });

    }
    const ratioContainerEle = document.querySelector('#ratioContainer');

    // 添加分辨率节点
    function createRatioNode() {
      [...ratioContainerEle.children].forEach((node) => {
        ratioContainerEle.removeChild(node);
      });

      ratios.forEach((item, index) => {
        const [width, height] = item;
        const ratioEle = document.createElement('div');
        ratioEle.setAttribute('class', 'resize__item');

        const ratioIdxEle = document.createElement('div');
        ratioIdxEle.setAttribute('class', 'resize__idx');
        ratioIdxEle.innerHTML = index + 1;

        const ratioLineEle = document.createElement('div');
        ratioLineEle.setAttribute('class', 'resize__line');

        const ratioValueEle = document.createElement('div');
        ratioValueEle.setAttribute('class', 'resize__value');
        ratioValueEle.innerHTML = `${width} × ${height}`;

        const ratioDeleteNode = document.createElement('img');
        ratioDeleteNode.setAttribute('class', 'resize__item-delete');
        ratioDeleteNode.setAttribute('src', './assets/delete.svg');
        ratioDeleteNode.setAttribute('type', 'image/svg+xml');

        ratioDeleteNode.onmouseenter = function () {
          ratioDeleteNode.setAttribute('src', './assets/delete-hover.svg');

        };
        ratioDeleteNode.onmouseleave = function () {
          ratioDeleteNode.setAttribute('src', './assets/delete.svg');
        };

        ratioDeleteNode.onclick = function (e) {
          e.stopPropagation();
          ratios.splice(index, 1);
          chrome.storage.sync.set({ ratios });
          createRatioNode();
        };

        ratioEle.appendChild(ratioIdxEle);
        ratioEle.appendChild(ratioLineEle);
        ratioEle.appendChild(ratioValueEle);
        ratioEle.appendChild(ratioDeleteNode);
        ratioContainerEle.appendChild(ratioEle);

        // 改变窗口大小
        ratioEle.onclick = function () {
          updateWindowSize(width, height);
        };
      });
    }

    createRatioNode();


    // 主动输入改变窗口事件
    const confirmButtonEle = document.querySelector('#confirmButton');

    confirmButtonEle.onclick = function () {
      const inputWidthNode = document.querySelector('#inputWidth');
      const inputHeightNode = document.querySelector('#inputHeight');
      const width = Number(inputWidthNode.value);
      const height = Number(inputHeightNode.value);
      console.log(44, ratios, width, height);
      if (width && height) {
        if (ratios.every(([itemWidth, itemHeight]) => !(itemWidth === width && itemHeight === height))) {
          ratios.push([width, height]);
          chrome.storage.sync.set({ ratios });
          createRatioNode();
        }
        updateWindowSize(width, height);

        // todo: 优化添加函数
        // 添加删除功能
        // 添加二维码
        // 字体稍微放大些
      }

    };

  });
};


// 给视窗类型选择绑定事件
function bindTypeEvent() {
  const typeViewportEle = document.querySelector('#typeViewport');
  const typeWindowEle = document.querySelector('#typeWindow');
  typeViewportEle.onclick = function () {
    selectType('viewport');
  };
  typeWindowEle.onclick = function () {
    selectType('window');
  };
}

// 视窗类型选中事件
function selectType(type) {
  selectTypeValue = type;
  const typeViewportEle = document.querySelector('#typeViewport');
  const typeWindowEle = document.querySelector('#typeWindow');
  typeViewportEle.setAttribute('class', 'resize__type-item');
  typeWindowEle.setAttribute('class', 'resize__type-item');

  const messageViewport = document.querySelector('#messageViewport');
  const windowViewport = document.querySelector('#windowViewport');
  messageViewport.setAttribute('style', '');
  windowViewport.setAttribute('style', '');

  if (type === 'viewport') {
    typeViewportEle.setAttribute('class', 'resize__type-item resize__type-item--active');
    messageViewport.setAttribute('style', 'color: #5eb035');
  }
  if (type === 'window') {
    typeWindowEle.setAttribute('class', 'resize__type-item resize__type-item--active');
    windowViewport.setAttribute('style', 'color: #5eb035');
  }
  chrome.storage.sync.set({ type });
}

// 不传参数时仅更新并计算视窗尺寸
function updateWindowSize(width, height) {
  chrome.windows.getCurrent(function (currentWindow) {
    const currentWindowEle = document.querySelector('#currentWindow');
    const currentViewportEle = document.querySelector('#currentViewport');
    windowId = currentWindow.id;
    const windowWidth = currentWindow.width;
    const windowHeight = currentWindow.height;

    currentWindowEle.innerHTML = `${windowWidth} × ${windowHeight}`;

    chrome.tabs.query({
      windowId: currentWindow.id,
      active: true
    }, function (currentTab) {
      if (currentTab[0]) {
        const tabWidth = currentTab[0].width;
        const tabHeight = currentTab[0].height;
        currentViewportEle.innerHTML = `${tabWidth} × ${tabHeight}`;

        if (width && height) {
          if (selectTypeValue === 'viewport') {
            width += windowWidth - tabWidth;
            height += windowHeight - tabHeight;
          }
          chrome.windows.update(windowId, { width: width, height: height }, function () {
            updateWindowSize();
          });
        }
      }
    });
  });
}



