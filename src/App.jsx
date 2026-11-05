import { useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'

function App() {
  const [msg, setMsg] = useState('')
  const [status, setStatus] = useState(false)
  const [emaillist, setEmailList] = useState([])
  const API = import.meta.env.VITE_API_URL

  const handleChange = (e) => {
    setMsg(e.target.value)
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    console.log(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target.result
      if (data) {
        console.log(data)
      }
      const workbook = XLSX.read(data, { type: 'binary' })
      const SheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[SheetName]
      console.log(worksheet)
      const emaillist = XLSX.utils.sheet_to_json(worksheet, { header: 'A' })
      const totalemails = emaillist.map((item) => { return (item.A) })
      console.log(totalemails)
      setEmailList(totalemails)
    }
    reader.readAsArrayBuffer(file)
  }

  const send = async () => {
    if (!msg.trim() || emaillist.length === 0) return;

    setStatus(true);
    try {
        const response = await axios.post(`${API}/sendemail`, { msg: msg, emaillist: emaillist });
        if (response.data === true) {
            alert("Email sent Successfully");
        } else {
            alert("Email not sent");
        }
    } catch (error) {
        console.error("Error sending emails:", error);
        alert("Failed to send emails. Please try again.");
    } finally {
        setStatus(false);
        setMsg('');
    }
  }


  return (
    <div className='min-h-screen p-2 sm:p-4 md:p-6 lg:p-8'>
      <div className='bg-blue-950 text-white text-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 lg:py-5'>
        <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium'>BulkMail</h1>
      </div>
      <div className='bg-blue-800 text-white text-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 lg:py-5'>
        <h1 className='text-sm sm:text-base md:text-lg lg:text-xl font-medium'>We can help your business with sending multiple emails at once</h1>
      </div>
      <div className='bg-blue-600 text-white text-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 lg:py-5'>
        <h1 className='text-sm sm:text-base md:text-lg lg:text-xl font-medium'>Drag and Drop</h1>
      </div>
      <div className='bg-blue-400 flex flex-col items-center text-black px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5'>
        <textarea onChange={handleChange} value={msg}
          className='w-full sm:w-[90%] md:w-[80%] lg:w-[70%] h-24 sm:h-28 md:h-32 lg:h-32 py-2 sm:py-3 outline-none bg-white px-3 sm:px-4 border border-black rounded-md text-sm sm:text-base md:text-lg' placeholder='Enter the email text ....'></textarea>
        <div className='w-full sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-md'>
          <input type="file" onChange={handleFile} className='file:bg-white file:px-3 file:py-2 border-4 border-white border-dashed py-3 sm:py-4 px-3 sm:px-4 mt-3 sm:mt-4 mb-3 sm:mb-4 w-full' />
        </div>
        <p className='text-sm sm:text-base mb-2 sm:mb-3'>Total Emails in the file: {emaillist.length}</p>
        <button onClick={send} disabled={!msg.trim()} className='transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-blue-950 py-2 sm:py-3 px-4 sm:px-5 md:px-6 lg:px-8 text-xs sm:text-sm md:text-base font-medium rounded-md w-full sm:w-auto md:w-fit'>{status ? "Sending..." : "Send"}</button>
      </div>
      <div className='bg-blue-300 text-white text-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 lg:py-8'>

      </div>
      <div className='bg-blue-200 text-white text-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 lg:py-8'>

      </div>
    </div>
  )
}

export default App
