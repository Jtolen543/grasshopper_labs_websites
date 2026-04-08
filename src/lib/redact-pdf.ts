import { exec } from "child_process"
import path from "path"
import util from "util"

const execAsync = util.promisify(exec)

/**
 * Utility to invoke the Python PyMuPDF script that completely
 * redacts text patterns/names from a PDF and returns a rasterized PNG.
 */
export async function redactPdfToImage(
  inputPdfPath: string, 
  outputPngPath: string, 
  studentName: string = ""
): Promise<string> {
  try {
    // The python script lives at the root of the project by default
    const scriptPath = path.resolve(process.cwd(), "scripts/redact.py")
    
    // We expect the environment to have python3 installed with pymupdf
    // Depending on the host environment, this may need to be python3.11 or python
    const command = `python3.11 "${scriptPath}" "${inputPdfPath}" "${outputPngPath}" "${studentName}"`
    
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr) {
      console.warn("Redaction Script Stderr:", stderr)
    }
    
    return outputPngPath
  } catch (error) {
    console.error("Failed to execute python redaction script:", error)
    throw error
  }
}
