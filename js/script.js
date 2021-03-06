const $ = {}
Element.prototype.appendAfter = function(element) {
    element.parentNode.insertBefore(this, element.nextSibling)
}


function noop() {}

function _createModalFooter(buttons= []) {
    if (!buttons) {
        return document.createElement('div')
    }

    const wrap = document.createElement('div')
    wrap.classList.add('modal__footer')

    buttons.forEach(button => {
        const $btn = document.createElement('button')
        $btn.textContent = button.text
        $btn.classList.add('btn')
        $btn.classList.add(`btn-${button.type || 'secondary'}`)
        $btn.addEventListener('click', button.handler || noop)
        wrap.appendChild($btn)
    })

    return wrap
}

function _createModal(params) {
    const DEFAULT_WIDTH = '600px'
    const modal = document.createElement('div')
    modal.classList.add('wmodal')
    modal.insertAdjacentHTML('afterbegin', `
    <div class="modal__overlay" data-close="true">
        <div class="modal__window" style="width: ${params.width || DEFAULT_WIDTH}">
            <div class="modal__body" data-content>
                ${params.content || ''}
            </div>
        </div>
    </div>
    `)
    const footer = _createModalFooter(params.footer)
    footer.appendAfter(modal.querySelector('[data-content]'))
    document.body.appendChild(modal)
    return modal
}

$.modal = function(params) {
    const ANIMATION_SPEED = 300
    const $modal = _createModal(params)
    let closing = false
    let destroyed = false

    const modal = {
        open() {
            if (!closing && !destroyed) {
                $modal.classList.add('open')
                document.body.style.overflow = 'hidden'
            }
        },
        close() {
            closing = true
            $modal.classList.remove('open')
            $modal.classList.add('hide')
            setTimeout(() => {
                $modal.classList.remove('hide')
                closing = false
                document.body.style.overflow = 'visible'
                if (typeof params.onClose === 'function') {
                    params.onClose()
                }
            }, ANIMATION_SPEED)
        },
    }

    const modalClickListener = event => {
        const target = event.target
        if (target.dataset.close) {
            modal.close()
        }
    }

    $modal.addEventListener('click', modalClickListener)

    return Object.assign(modal, {
        destroy() {
            $modal.parentNode.removeChild($modal)
            $modal.removeEventListener('click', modalClickListener)
            destroyed = true
        },
        setContent(html) {
            $modal.querySelector('[data-content]').innerHTML = html
        }
    })
}

const board = document.querySelector('.board')
const nowStep = document.querySelector('.now-step')

let symbol = 'x'

nowStep.innerHTML = `
    <h2 class="now-step__text">Сейчас ходят</h2>
    <div class="board__symbol_x">
        <span class="board__symbol_x-line"></span>
        <span class="board__symbol_x-line"></span>
    </div>
`

const getBoardSymbol = x => {
    return board.querySelector(`.board__section:nth-child(${x})`).querySelector('.board__symbol').classList.value
}

const closeHandler = () => {
    board.innerHTML = `
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <div class="board__section">
            <span class="board__symbol"></span>
        </div>
        <span class="board__line"></span>
    `
    modal.close()
    board.addEventListener('click', boardClickHandler)
}

const modal = $.modal({
    content: `
        <h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>
    `,
    footer: [
        {
            text: 'Продолжить',
            handler() {
                closeHandler()
            },
        },
    ],
    width: '300px',
})

const showBoardLine = (top=0, left=-0.1, angle=0) => {
    const boardLine = document.querySelector('.board__line')
    boardLine.style.top = `${(top)*100}%`
    boardLine.style.left = `${(left)*100}%`
    boardLine.style.transform = `translate(-${(left)*100}%, -${(top)*100}%)`
    if (angle !== 0) {
        boardLine.style.transform = `rotate(${angle}deg)`
    }
    if (angle === 45) {
        boardLine.style.width = '170%'
    } else if (angle === -45) {
        boardLine.style.top = '108%'
        boardLine.style.width = '170%'
    }
    boardLine.style.display = 'inline'
}

const boardClickHandler = e => {
    let target = e.target.closest('.board__section')

    if (target.classList.contains('board__section')) {
        if (!target.classList.contains('board__selection_active')) {
            target.classList.add('board__selection_active')
            target.querySelector('.board__symbol').classList.add(`board__symbol_${symbol}`)

            if (symbol === 'x') {
                target.querySelector('.board__symbol').innerHTML = `
                    <span class="board__symbol_x-line"></span>
                    <span class="board__symbol_x-line"></span>
                `

                nowStep.innerHTML = `
                    <h2 class="now-step__text">Сейчас ходят</h2>
                    <div class="board__symbol_0">
                        <span class="board__symbol_0-circle"></span>
                    </div>
                `
                symbol = '0'
            } else {
                target.querySelector('.board__symbol').innerHTML = `
                    <span class="board__symbol_0-circle"></span>
                `
                nowStep.innerHTML = `
                    <h2 class="now-step__text">Сейчас ходят</h2>
                    <div class="board__symbol_x">
                        <span class="board__symbol_x-line"></span>
                        <span class="board__symbol_x-line"></span>
                    </div>
                `
                symbol = 'x'
            }

            if ((getBoardSymbol(1) === getBoardSymbol(2)) && (getBoardSymbol(1) === getBoardSymbol(3))
                && (getBoardSymbol(1) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(1/6)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()


            } else if ((getBoardSymbol(4) === getBoardSymbol(5)) && (getBoardSymbol(4) === getBoardSymbol(6))
                && (getBoardSymbol(4) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(1/2)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(7) === getBoardSymbol(8)) && (getBoardSymbol(7) === getBoardSymbol(9))
                && (getBoardSymbol(7) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(5/6)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(1) === getBoardSymbol(4)) && (getBoardSymbol(1) === getBoardSymbol(7))
                && (getBoardSymbol(1) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(-0.1, 1/6, 90)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(2) === getBoardSymbol(5)) && (getBoardSymbol(2) === getBoardSymbol(8))
                && (getBoardSymbol(2) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(-0.1, 1/2, 90)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(3) === getBoardSymbol(6)) && (getBoardSymbol(3) === getBoardSymbol(9))
                && (getBoardSymbol(3) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(-0.1, 5/6, 90)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(1) === getBoardSymbol(5)) && (getBoardSymbol(1) === getBoardSymbol(9))
                && (getBoardSymbol(1) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(-0.1, -0.09, 45)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else if ((getBoardSymbol(7) === getBoardSymbol(5)) && (getBoardSymbol(7) === getBoardSymbol(3))
                && (getBoardSymbol(7) !== 'board__symbol')) {
                board.removeEventListener('click', boardClickHandler)
                showBoardLine(-0.1, -0.09, -45)
                modal.setContent(`<h3 class="modal__title">Победили ${(symbol === '0') ? 'Крестики': 'Нолики'}</h3>`)
                modal.open()

            } else {
                const boardSymbols = document.querySelectorAll('.board__symbol')
                let k = 0
                boardSymbols.forEach(el => {
                    if (!el.closest('.board__section').classList.contains('board__selection_active')) {
                        k += 1
                    }
                })
                if (k === 0) {
                    modal.setContent(`<h3 class="modal__title">Ничья</h3>`)
                    modal.open()
                }
            }
        }
    }
}

board.addEventListener('click', boardClickHandler)