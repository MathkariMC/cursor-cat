const cat = document.querySelector(".cursor-cat")
const facingElement = document.querySelector(".cat-facing")
const spark = document.querySelector(".click-spark")
const monty = document.querySelector(".monty")

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

let size = { width: cat.offsetWidth, height: cat.offsetHeight }
let targetX = Math.max(22, window.innerWidth * .14)
let targetY = window.innerHeight - size.height - 38
let currentX = targetX
let currentY = targetY
let facing = 1
let pounceTimer
let montyCenter = { x: window.innerWidth - 110, y: window.innerHeight - 90 }
let montyIsHappy = false

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(minimum, value), maximum)
}

function measureScene() {
  size = { width: cat.offsetWidth, height: cat.offsetHeight }
  const montyBox = monty.getBoundingClientRect()
  montyCenter = {
    x: montyBox.left + montyBox.width / 2,
    y: montyBox.top + montyBox.height / 2,
  }

  targetX = clamp(targetX, 12, window.innerWidth - size.width - 12)
  targetY = clamp(targetY, 12, window.innerHeight - size.height - 12)
}

function setTarget(clientX, clientY) {
  const edgeBuffer = size.width + 58
  const offsetX = clientX > window.innerWidth - edgeBuffer ? -size.width - 20 : 24
  const nextFacing = offsetX < 0 ? -1 : 1

  targetX = clamp(clientX + offsetX, 12, window.innerWidth - size.width - 12)
  targetY = clamp(clientY - size.height / 2, 12, window.innerHeight - size.height - 12)

  if (nextFacing !== facing) {
    facing = nextFacing
    facingElement.style.setProperty("--cat-facing", String(facing))
  }

  const eyeX = clamp((clientX - (targetX + size.width / 2)) / 20, -3, 3)
  const eyeY = clamp((clientY - (targetY + size.height * .39)) / 20, -2.5, 2.5)
  facingElement.style.setProperty("--eye-x", `${eyeX * facing}px`)
  facingElement.style.setProperty("--eye-y", `${eyeY}px`)
}

function updateMontyMood() {
  const catCenterX = currentX + size.width / 2
  const catCenterY = currentY + size.height / 2
  const deltaX = catCenterX - montyCenter.x
  const deltaY = catCenterY - montyCenter.y
  const distance = Math.hypot(deltaX, deltaY)
  const happyDistance = clamp(window.innerWidth * .22, 155, 255)
  const shouldBeHappy = distance < happyDistance

  if (shouldBeHappy !== montyIsHappy) {
    montyIsHappy = shouldBeHappy
    monty.dataset.happy = String(montyIsHappy)
  }

  monty.style.setProperty("--dog-eye-x", `${clamp(deltaX / 80, -2.2, 2.2)}px`)
  monty.style.setProperty("--dog-eye-y", `${clamp(deltaY / 80, -1.6, 1.6)}px`)
}

function pounce(clientX, clientY) {
  setTarget(clientX, clientY)
  cat.classList.remove("is-pouncing")
  void cat.offsetWidth
  cat.classList.add("is-pouncing")

  spark.style.left = `${clientX}px`
  spark.style.top = `${clientY}px`
  spark.classList.remove("is-burst")
  void spark.offsetWidth
  spark.classList.add("is-burst")

  window.clearTimeout(pounceTimer)
  pounceTimer = window.setTimeout(() => cat.classList.remove("is-pouncing"), 540)
}

function animate() {
  const ease = reducedMotion.matches ? 1 : .115
  currentX += (targetX - currentX) * ease
  currentY += (targetY - currentY) * ease
  cat.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
  updateMontyMood()
  window.requestAnimationFrame(animate)
}

window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch") setTarget(event.clientX, event.clientY)
}, { passive: true })

window.addEventListener("pointerdown", (event) => {
  pounce(event.clientX, event.clientY)
}, { passive: true })

window.addEventListener("resize", measureScene)

facingElement.style.setProperty("--cat-facing", String(facing))
measureScene()
window.requestAnimationFrame(animate)
