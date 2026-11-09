import { useRef, useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { Routes, Route, Link } from 'react-router-dom'
import History from './History'

function App() {
    const [msg, setMsg] = useState('')
    const [status, setStatus] = useState(false)
    const [emaillist, setEmailList] = useState([])
    const [invalidEmailCount, setInvalidEmailCount] = useState(0)
    const [sendMessage, setSendMessage] = useState('')
    const [sendMessageType, setSendMessageType] = useState('')
    const sendLock = useRef(false)
    const [sentHistory, setSentHistory] = useState(JSON.parse(localStorage.getItem('sentHistory') || '[]'))
    const API = import.meta.env.VITE_API_URL || "https://bulkmail-react-backend-1.onrender.com"

  const handleChange = (e) => {
    setMsg(e.target.value)
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        if (!data) throw new Error('The selected file could not be read.')

        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        if (!firstSheet) throw new Error('The selected workbook does not contain a worksheet.')

        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 'A' })
        const values = rows.map((row) => row.A).filter((value) => value != null && String(value).trim())
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const validEmails = values
          .map((value) => String(value).trim())
          .filter((email) => emailPattern.test(email))

        setEmailList(validEmails)
        setInvalidEmailCount(values.length - validEmails.length)
        setSendMessage('')
      } catch (error) {
        setEmailList([])
        setInvalidEmailCount(0)
        setSendMessage(error.message || 'Could not read the selected Excel file.')
        setSendMessageType('error')
      }
    }
    reader.onerror = () => {
      setEmailList([])
      setInvalidEmailCount(0)
      setSendMessage('The selected file could not be read.')
      setSendMessageType('error')
    }
    reader.readAsArrayBuffer(file)
  }

  const send = async () => {
    if (sendLock.current || status) return
    if (emaillist.length === 0) {
      setSendMessage('Please select an Excel file containing valid email addresses.')
      setSendMessageType('error')
      return
    }

    if (!msg.trim()) {
      setSendMessage('Please enter an email message.')
      setSendMessageType('error')
      return
    }

    sendLock.current = true
    setStatus(true)
    setSendMessage('')
    try {
      const response = await axios.post(`${API}/sendemail`, { msg, emaillist })
      const body = response.data
      const confirmed = body === true || body === 'true' ||
        body?.success === true || body?.status === 'success'
      const sentCount = Number.isInteger(body?.sent) ? body.sent : emaillist.length

      if (!confirmed) {
        const detail = typeof body === 'string' ? body : body?.message || body?.error
        const failureMessage = body === false || body === 'false'
          ? 'The configured backend returned failure without details. Deploy the updated Backend/index.js to the configured API and set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and SMTP_FROM in that backend’s environment. Then check its server logs for the SMTP error.'
          : detail || 'The email server did not confirm delivery. Check the backend SMTP configuration and server logs.'
        throw new Error(failureMessage)
      }
      if (sentCount !== emaillist.length) {
        throw new Error(`The server confirmed ${sentCount} of ${emaillist.length} emails. Check backend logs before retrying to avoid duplicate emails.`)
      }

      setSendMessage(`Email sent successfully to ${sentCount} recipient${sentCount === 1 ? '' : 's'}.`)
      setSendMessageType('success')
      setMsg('')
      const historyEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        message: msg,
        recipients: sentCount,
        emails: [...emaillist],
        status: 'Sent'
      }
      const newHistory = [historyEntry, ...sentHistory]
      setSentHistory(newHistory)
      try {
        localStorage.setItem('sentHistory', JSON.stringify(newHistory))
      } catch (storageError) {
        console.warn('Could not save email history locally:', storageError)
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      const sentBeforeFailure = error.response?.data?.sent
      const partialDelivery = Number.isInteger(sentBeforeFailure) && sentBeforeFailure > 0
        ? ` ${sentBeforeFailure} email${sentBeforeFailure === 1 ? ' was' : 's were'} sent before the failure.`
        : ''
      setSendMessage(`${error.response?.data?.message || error.message || 'Failed to send emails. Please try again.'}${partialDelivery}`)
      setSendMessageType('error')
    } finally {
      sendLock.current = false
      setStatus(false)
    }
  }


  return (
      <div>
        <nav className="bg-blue-950 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold text-white tracking-tight">BulkMail</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/" className="px-2 sm:px-4 py-2 text-sm sm:text-base text-white hover:text-blue-100 transition-colors">Home</Link>
              <Link to="/history" className="px-2 sm:px-4 py-2 text-sm sm:text-base text-white hover:text-blue-100 transition-colors">History</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className='min-h-screen bg-gray-50 p-3 sm:p-8 flex flex-col items-center justify-center font-sans overflow-x-hidden'>
              <div className='w-full max-w-md mx-auto'>
                <div className='bg-blue-950 text-white text-center px-5 py-3 rounded-t-2xl'>
                  <h1 className='text-2xl font-medium'>BulkMail</h1>
                </div>
                <div className='bg-blue-800 text-white text-center px-5 py-3'>
                  <h1 className='font-medium'>We can help your business with sending multible emails at once</h1>
                </div>
                <div className='bg-blue-600 text-white text-center px-5 py-3'>
                  <h1 className='font-medium'>Drag and Drop</h1>
                </div>
                <div className='bg-blue-400 flex flex-col items-center text-black px-4 sm:px-5 py-3 rounded-b-2xl shadow-lg'>
                  <textarea onChange={handleChange} value={msg}
                    className='w-full sm:w-[90%] h-32 py-2 outline-none bg-white px-2 border border-black rounded-md' placeholder='Enter the email text ....'></textarea>
                  <div className='w-full min-w-0'>
                    <input type="file" accept=".xlsx,.xls" onChange={handleFile} className='box-border w-full max-w-full file:bg-white file:px-2 sm:file:px-3 file:py-2 border-4 border-white border-dashed py-3 px-2 sm:px-4 mt-5 mb-5 text-xs sm:text-sm' />
                  </div>
                  <p className='mb-2 text-center text-sm sm:text-base'>Total valid emails in the file: {emaillist.length}</p>
                  {invalidEmailCount > 0 && <p className='mb-2 text-center text-sm text-red-950'>{invalidEmailCount} invalid or blank email entr{invalidEmailCount === 1 ? 'y was' : 'ies were'} skipped.</p>}
                  {sendMessage && <p role='status' aria-live='polite' className={`mb-3 max-w-full break-words text-center text-sm sm:text-base ${sendMessageType === 'success' ? 'text-green-950' : 'text-red-950'}`}>{sendMessage}</p>}
                  <button onClick={send} disabled={!msg.trim() || emaillist.length === 0 || status} className='transition-all duration-300 ease-in-out hover:scale-110 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-blue-950 py-2 px-8 sm:px-8 sm:py-3 text-white font-medium rounded-md w-full sm:w-fit'>{status ? "Sending..." : "Send"}</button>
                </div>
                
              </div>
            </div>
          } />
          <Route path="/history" element={<History sentHistory={sentHistory} />} />
        </Routes>
      </div>
  )
}

export default App
