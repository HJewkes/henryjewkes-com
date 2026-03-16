import fs from 'fs'
import path from 'path'

const API_KEY = process.env.GEMINI_API_KEY
const API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent'
const OUTPUT_DIR = path.resolve('public/mascots/grounded')

const teams = [
  'Duke University', 'Siena College', 'Ohio State University', 'TCU',
  'St. Johns University', 'University of Northern Iowa', 'University of Kansas', 'California Baptist University',
  'University of Louisville', 'University of South Florida', 'Michigan State University', 'North Dakota State University',
  'UCLA', 'UCF', 'University of Connecticut', 'Furman University',
  'University of Arizona', 'Long Island University', 'Villanova University', 'Utah State University',
  'University of Wisconsin', 'High Point University', 'University of Arkansas', 'University of Hawaii',
  'BYU', 'NC State', 'Gonzaga University', 'Kennesaw State University',
  'University of Miami', 'University of Missouri', 'Purdue University', 'Queens University of Charlotte',
  'University of Florida', 'Lehigh University', 'Clemson University', 'University of Iowa',
  'Vanderbilt University', 'McNeese State University', 'University of Nebraska', 'Troy University',
  'University of North Carolina', 'VCU', 'University of Illinois', 'University of Pennsylvania',
  'Saint Marys College of California', 'Texas A&M University', 'University of Houston', 'University of Idaho',
  'University of Michigan', 'Howard University', 'University of Georgia', 'Saint Louis University',
  'Texas Tech University', 'University of Akron', 'University of Alabama', 'Hofstra University',
  'University of Tennessee', 'SMU', 'University of Virginia', 'Wright State University',
  'University of Kentucky', 'Santa Clara University', 'Iowa State University', 'Tennessee State University',
]

// Map university names to bracket data keys (for file naming)
const fileNames = [
  'Duke', 'Siena', 'Ohio_State', 'TCU',
  'St_Johns', 'Northern_Iowa', 'Kansas', 'California_Baptist',
  'Louisville', 'South_Florida', 'Michigan_State', 'North_Dakota_State',
  'UCLA', 'UCF', 'UConn', 'Furman',
  'Arizona', 'Long_Island_University', 'Villanova', 'Utah_State',
  'Wisconsin', 'High_Point', 'Arkansas', 'Hawaii',
  'BYU', 'NC_State', 'Gonzaga', 'Kennesaw_State',
  'Miami', 'Missouri', 'Purdue', 'Queens',
  'Florida', 'Lehigh', 'Clemson', 'Iowa',
  'Vanderbilt', 'McNeese', 'Nebraska', 'Troy',
  'North_Carolina', 'VCU', 'Illinois', 'Penn',
  'Saint_Marys', 'Texas_AM', 'Houston', 'Idaho',
  'Michigan', 'Howard', 'Georgia', 'Saint_Louis',
  'Texas_Tech', 'Akron', 'Alabama', 'Hofstra',
  'Tennessee', 'SMU', 'Virginia', 'Wright_State',
  'Kentucky', 'Santa_Clara', 'Iowa_State', 'Tennessee_State',
]

const PROMPT_TEMPLATE = (university) => `Search for images of the ${university} mascot.

Generate a simple, friendly cartoon illustration of this mascot. The illustration should be:
- In a fun, confident pose like they're ready for a big game
- Simple flat illustration style with minimal detail
- Cute and approachable, suitable for a 5 year old
- Full body character, centered in frame
- Solid contrasting dark background
- No text, words, or letters anywhere in the image`

async function generateOne(university, fileName, variant) {
  const outPath = path.join(OUTPUT_DIR, `${fileName}_v${variant}.png`)
  if (fs.existsSync(outPath)) {
    return true
  }

  const body = {
    contents: [{ parts: [{ text: PROMPT_TEMPLATE(university) }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }

  try {
    const res = await fetch(`${API}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ✗ ${fileName}_v${variant}: HTTP ${res.status}`)
      return false
    }

    const data = await res.json()
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart) {
      console.error(`  ✗ ${fileName}_v${variant}: No image in response`)
      return false
    }

    const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
    fs.writeFileSync(outPath, buffer)
    console.log(`  ✓ ${fileName}_v${variant} (${(buffer.length / 1024).toFixed(0)}KB)`)
    return true
  } catch (err) {
    console.error(`  ✗ ${fileName}_v${variant}: ${err.message}`)
    return false
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`Generating 3 variants for ${teams.length} teams (${teams.length * 3} total images)...\n`)

  let success = 0
  let total = 0

  for (let i = 0; i < teams.length; i++) {
    const university = teams[i]
    const fileName = fileNames[i]
    console.log(`[${i + 1}/${teams.length}] ${university}`)

    // Generate 1 variant per team
    const ok = await generateOne(university, fileName, 1)
    if (ok) success++
    total++
    // 20s delay between teams for grounding reliability
    if (i < teams.length - 1) {
      await new Promise(r => setTimeout(r, 20000))
    }
  }

  console.log(`\nDone: ${success}/${total} images generated`)
}

main()
