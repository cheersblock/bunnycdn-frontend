import React, { useRef, useState, useEffect } from "react";
import "./FileUpload.css";
import axios from "axios";
import io from "socket.io-client";

const FileUpload = () => {
  const inputRef = useRef();
  const socket = io("ws://localhost:4000/"); // Change the URL to match your backend server URL

  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");
  const [downloadStatus, setDownloadStatus] = useState("select");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect");
      socket.emit("hello");
    });
    // Listen for progress updates from the server
    socket.on("progress", (data) => {
      console.log("🚀 ~ socket.on ~ progress:", data)
      const percentCompleted = Math.round(
        (data.filesDoneUpl * 100) / data.numberOfFiles
      );
      setProgress(percentCompleted);
    });

    // Listen for completion from the server
    socket.on("uploadComplete", () => {
      setUploadStatus("done");
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });

    return () => {
      // Disconnect socket on component unmount
      socket.disconnect();
    };
  }, []);
  
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setProgress(0);
    setUploadStatus("select");
  };

  const handleUpload = async () => {
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("zipFile", selectedFile);

      const response = await axios.post(
        "http://localhost:4000/file/upload-bunny",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            // const percentCompleted = Math.round(
            //   (progressEvent.loaded * 100) / progressEvent.total
            // );
            // setProgress(percentCompleted);
          },
        }
      );

      setUploadStatus("done");
    } catch (error) {
      setUploadStatus("select");
    }
  };

  const handleDownload = async () => {
    if (downloadStatus === "done") {
      return;
    }

    try {
      setDownloadStatus("downloading");

      const response = await axios.get(
        "http://localhost:4000/file/start-download",
        {
          onDownloadProgress: (progressEvent) => {
            // const percentCompleted = Math.round(
            //   (progressEvent.loaded * 100) / progressEvent.total
            // );
            // setProgress(percentCompleted);
          },
        }
      );

      setDownloadStatus("done");
    } catch (error) {
      setDownloadStatus("select");
    }
  };


  return (
    <div className="file-upload-container">
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Button to trigger the file input dialog */}
      {!selectedFile && (
        <button className="file-btn" onClick={onChooseFile}>
          <span className="material-symbols-outlined">upload</span> Upload Zip
        </button>
      )}

      {selectedFile && (
        <>
          <div className="file-card">
            <span className="material-symbols-outlined icon">description</span>

            <div className="file-info">
              <div style={{ flex: 1 }}>
                <h6>{selectedFile?.name}</h6>

                <div className="progress-bg">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {uploadStatus === "select" ? (
                <button onClick={clearFileInput}>
                  <span class="material-symbols-outlined close-icon">
                    close
                  </span>
                </button>
              ) : (
                <div className="check-circle">
                  {uploadStatus === "uploading" ? (
                    `${progress}%`
                  ) : uploadStatus === "done" ? (
                    <span
                      class="material-symbols-outlined"
                      style={{ fontSize: "20px" }}
                    >
                      check
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <button className="upload-btn" onClick={handleUpload}>
            {uploadStatus === "select" || uploadStatus === 'uploading' ? "Upload" : "Done"}
          </button>
        </>
      )}
    </div>
    <div>
      {/* <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      /> */}

      {/* Button to trigger the file input dialog */}
      {downloadStatus === "select" && (
        <button className="file-btn" onClick={()=>{ setDownloadStatus("downloading")}}>
          <span className="material-symbols-outlined">download</span> Download Files
        </button>
      )}

      {downloadStatus === "downloading" && (
        <div>
          <div className="file-card">
            <span className="material-symbols-outlined icon">description</span>

            <div className="file-info">
              <div style={{ flex: 1 }}>
                <h6>{selectedFile?.name}</h6>

                <div className="progress-bg">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {downloadStatus === "select" ? (
                <button onClick={clearFileInput}>
                  <span class="material-symbols-outlined close-icon">
                    close
                  </span>
                </button>
              ) : (
                <div className="check-circle">
                  {downloadStatus === "downloading" ? (
                    `${progress}%`
                  ) : downloadStatus === "done" ? (
                    <span
                      class="material-symbols-outlined"
                      style={{ fontSize: "20px" }}
                    >
                      check
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <button className="upload-btn" onClick={handleDownload}>
            {downloadStatus === "select" || downloadStatus === 'downloading' ? "Download" : "Done"}
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default FileUpload;
