const cat = document.querySelector(".cursor-cat")
const facingElement = document.querySelector(".cat-facing")
const heart = document.querySelector(".heart")

const CAT_DESKTOP = { width: 150, height: 132 }
const CAT_MOBILE = { width: 112, height: 99 }
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
const finePointer = window.matchMedia("(pointer: fine)")

let size = finePointer.matches ? CAT_DESKTOP : CAT_MOBILE
let targetX = window.innerWidth - size.width - 32
let targetY = window.innerHeight - size.height - 32
let currentX = targetX
let currentY = targetY
let facing = 1
let hasWoken = false
let pounceTimer

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(minimum, value), maximum)
}

function setTarget(clientX, clientY) {
  const offsetX = clientX > window.innerWidth - 190 ? -size.width - 22 : 28
  const nextFacing = offsetX < 0 ? -1 : 1

  targetX = clamp(clientX + offsetX, 14, window.innerWidth - size.width - 14)
  targetY = clamp(clientY - size.height / 2, 72, window.innerHeight - size.height - 14)

  if (nextFacing !== facing) {
    facing = nextFacing
    facingElement.style.setProperty("--cat-facing", String(facing))
  }

  const eyeX = clamp((clientX - (targetX + size.width / 2)) / 20, -3, 3)
  const eyeY = clamp((clientY - (targetY + size.height * .39)) / 20, -2.5, 2.5)
  facingElement.style.setProperty("--eye-x", `${eyeX * facing}px`)
  facingElement.style.setProperty("--eye-y", `${eyeY}px`)

  if (!hasWoken) {
    hasWoken = true
    cat.dataset.awake = "true"
  }
}

function pounce(clientX, clientY) {
  setTarget(clientX, clientY)
  cat.classList.remove("is-pouncing")
  void cat.offsetWidth
  cat.classList.add("is-pouncing")

  heart.style.left = `${clientX}px`
  heart.style.top = `${clientY - 24}px`
  heart.classList.remove("is-floating")
  void heart.offsetWidth
  heart.classList.add("is-floating")

  window.clearTimeout(pounceTimer)
  pounceTimer = window.setTimeout(() => cat.classList.remove("is-pouncing"), 540)
}

function animate() {
  const ease = reducedMotion.matches ? 1 : .115
  currentX += (targetX - currentX) * ease
  currentY += (targetY - currentY) * ease
  cat.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
  window.requestAnimationFrame(animate)
}

window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch") setTarget(event.clientX, event.clientY)
}, { passive: true })

window.addEventListener("pointerdown", (event) => {
  pounce(event.clientX, event.clientY)
}, { passive: true })

window.addEventListener("resize", () => {
  size = finePointer.matches ? CAT_DESKTOP : CAT_MOBILE
  targetX = clamp(targetX, 14, window.innerWidth - size.width - 14)
  targetY = clamp(targetY, 72, window.innerHeight - size.height - 14)
})

facingElement.style.setProperty("--cat-facing", String(facing))
window.requestAnimationFrame(animate)
