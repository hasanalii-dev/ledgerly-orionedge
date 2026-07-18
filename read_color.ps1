Add-Type -AssemblyName System.Drawing
$imagePath = "c:\Users\hasan\.gemini\antigravity-ide\brain\311d8d62-a6ea-487b-9799-afee21c6904e\media__1784408870314.png"
$img = New-Object System.Drawing.Bitmap($imagePath)
$color = $img.GetPixel(10, 10)
Write-Host "Hex: #$($color.R.ToString('X2'))$($color.G.ToString('X2'))$($color.B.ToString('X2'))"
