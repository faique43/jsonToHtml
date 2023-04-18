const express = require("express");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000; // Change this to the desired port number

// Middleware to parse JSON request body
app.use(express.json());

// Endpoint to generate PDF and send via email
app.post("/generate-pdf", async (req, res) => {
  try {
    const data = req.body; // Get data from request body
    const pdfBuffer = await generatePdf(data);
    await sendEmail(pdfBuffer);
    res.status(200).send("PDF sent via email successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to generate PDF and send via email.");
  }
});

// Function to generate PDF from provided data
async function generatePdf(data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Convert data to HTML template
  const html = convertToHtml(data);

  // Set the HTML content of the page
  await page.setContent(html);

  // Generate PDF from the HTML content
  const pdfBuffer = await page.pdf();

  await browser.close();
  return pdfBuffer;
}

// Function to convert data to HTML template
function convertToHtml(data) {
  // Implement logic to convert data to HTML template
  // You can use any templating engine of your choice, e.g., Handlebars, EJS, etc.
  // Here's an example using template literals

  const { title, section_info, section_detail, section_end } = data;

  const html = `
    <html>
      <head>
        <style>
          /* Add your styles here */
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div style="background-color: ${section_info.page_1.background_color}">
          <h2>${section_info.page_1.title}</h2>
          <p>${section_info.page_1.para_1}</p>
          <p>${section_info.page_1.para_2}</p>
          <div style="display: flex">
            ${section_info.page_1.para_1_images.images
              .map((image) => `<img src="${image}" alt="Image" />`)
              .join("")}
          </div>
        </div>
        <div style="background-color: ${section_detail.background_color}">
          <h2>${section_detail.title}</h2>
          <p>${section_detail.has_chart}</p>
          <p>${section_detail.number_of_charts}</p>
          ${section_detail.chart_data
            .map(
              (chart) => `
            <div>
              <p>${chart.shape}</p>
              ${chart.data
                .map(
                  (data) => `
                <p>${data.name}</p>
                <p>${data.value}</p>
              `
                )
                .join("")}
            </div>
          `
            )
            .join("")}
        </div>
        <div style="background-color: ${section_end.background_color}">
          <p>${section_end.para_1}</p>
          <div style="display: flex">
            ${section_end.para_1_images.images
              .map((image) => `<img src="${image}" alt="Image" />`)
              .join("")}
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
}

// Function to send email with PDF attachment
async function sendEmail(pdfBuffer) {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "faiqueahmadkhan@gmail.com", // Replace with your Gmail email address
      pass: "jkxxctfnizxsnpoo", // Replace with your Gmail email password
    },
  });

  // Create an email with PDF attachment
  const mailOptions = {
    from: "faiqueahmadkhan@gmail.com", // Replace with your Gmail email address
    to: "fkhan.bese20seecs@seecs.edu.pk", // Replace with recipient email address
    subject: "PDF Report",
    text: "Please find attached PDF report.",
    attachments: [
      {
        filename: "report.pdf",
        content: pdfBuffer,
      },
    ],
  };

  // Send the email
  await transporter.sendMail(mailOptions);

  console.log("Email sent successfully!");
}

// Start the Express app
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
