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

  const send = () => {

    // Implementation for sending emails
    setStatus(true)
    axios.post(`${API}/sendemail`, { msg: msg, emaillist: emaillist })
      .then((data) => {
        if (data.data === true) {
          alert(" Email sent Successfully")
          setStatus(false)
        } else {
          alert("Email not sent")
        }
      })
    console.log("Message sent:", msg)
    setMsg('')
  }


  return (
    <div>
      <div className='bg-blue-950 text-white text-center'>
        <h1 className='text-2xl font-medium px-5 py-3'>BulkMail</h1>
      </div>
      <div className='bg-blue-800 text-white text-center'>
        <h1 className='font-medium px-5 py-3'>We can help your business with sending multible emails at once</h1>
      </div>
      <div className='bg-blue-600 text-white text-center'>
        <h1 className='font-medium px-5 py-3'>Drag and Drop</h1>
      </div>
      <div className='bg-blue-400 flex flex-col items-center text-black px-5 py-3'>
        <textarea onChange={handleChange} value={msg}
          className='w-[80%] h-32 py-2 outline-none bg-white px-2 border border-black rounded-md' placeholder='Enter the email text ....'></textarea>
        <div>
          <input type="file" onChange={handleFile} className='file:bg-white file:px-3 file:py-2 border-4 border-white border-dashed py-4 px-4 mt-5 mb-5' />
        </div>
        <p className='mb-2'>Total Emails in the file: {emaillist.length}</p>
        <button onClick={send} disabled={!msg.trim()} className='transition-all duration-300 ease-in-out hover:scale-110 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-blue-950 py-2 px-5 sm:px-8 sm:py-3 text-white font-medium rounded-md w-fit'>{status ? "Sending..." : "Send"}</button>
      </div>
      <div className='bg-blue-300 text-white text-center p-8'>

      </div>
      <div className='bg-blue-200 text-white text-center p-8'>

      </div>
    </div>
  )
}

export default App
