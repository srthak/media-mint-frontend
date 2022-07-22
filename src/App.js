import "./App.css";
import { useState, useEffect } from "react";
import arrow from "./arrow.svg";
import EditIcon from "./EditIcon.svg";
import CloseIcon from "./close-icon.svg";
let requestOptions = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  //body: JSON.stringify(passBody),
};

let url = "https://media-mint.herokuapp.com";

function App() {
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalData, setModalData] = useState({});
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchSinglePageData(1);
  }, []);

  const fetchSinglePageData = function (pageNo) {
    fetch(
      url +
        "/getUserFromMyDatabase?" +
        new URLSearchParams({
          page: pageNo,
        })
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setUserList(data.users);
        setPage(data.page);
      });
  };

  const handlePage = function (direction) {
    if (direction === "left") {
      if (pageNo === 1) {
        return;
      } else {
        fetchSinglePageData(pageNo - 1);
        setPageNo(pageNo - 1);
      }
    }
    if (direction === "right") {
      if (pageNo === page) {
        return;
      } else {
        fetchSinglePageData(pageNo + 1);
        setPageNo(pageNo + 1);
      }
    }
  };

  const convertJSONToCSV = function (jsonObject) {
    var array = typeof jsonObject !== "object" ? JSON.parse(jsonObject) : jsonObject;

    var stringData = "";

    for (var i = 0; i < array.length; i++) {
      var rowData = "";
      for (var j in array[i]) {
        if (rowData !== "") rowData += ",";

        rowData += array[i][j];
      }

      stringData += rowData + "\r\n";
    }
    return stringData;
  };

  const exportCSVFile = function (fileName, csvHeaders, formattedData) {
    if (csvHeaders) {
      formattedData.unshift(csvHeaders);
    }
    var jsonObject = JSON.stringify(formattedData);

    var csvObject = convertJSONToCSV(jsonObject);

    var exportFileName = fileName + ".csv" || "exportData.csv";

    var blobData = new Blob([csvObject], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blobData, exportFileName);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        var url = URL.createObjectURL(blobData);
        link.setAttribute("href", url);
        link.setAttribute("download", exportFileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleExtractCsv = function (type) {
    var csvHeaders = {
      Name: "Name",
      Email: "Email",
      Gender: "Gender",
      Status: "Status",
    };
    if (type === "above") {
      let formattedData = [];
      userList.forEach((data) => {
        formattedData.push({ Name: data.name, Email: data.email, Gender: data.gender, Status: data.status });
      });
      exportCSVFile(`user${pageNo}data`, csvHeaders, formattedData);
    } else {
      //getAllUsersFromMyDatabase
      fetch(url + "/getAllUsersFromMyDatabase")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let formattedData = [];
          data.users.forEach((val) => {
            formattedData.push({ Name: val.name, Email: val.email, Gender: val.gender, Status: val.status });
          });
          exportCSVFile(`users`, csvHeaders, formattedData);
        });
    }
  };

  const handleFetchMoreUsers = function () {
    fetch(url + "/storeUserInMyDatabase", requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPage(data.page);
      });
  };

  const handleSetModalData = function (data) {
    setId(data._id);
    setName(data.name);
    setEmail(data.email);
    setGender(data.gender);
    setStatus(data.status);
  };

  const handleChangeGender = function (e) {
    setGender(e.target.value);
  };

  const handleChangeStatus = function (e) {
    setStatus(e.target.value);
  };

  const handleUpdate = function () {
    if (name.trim().length < 2) {
      alert("Please enter at least 2 characters");
      return;
    }
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+?\.[a-zA-Z]{2,3}$/.test(email)) {
      let requestOptionsPatch = { ...requestOptions };
      requestOptionsPatch.method = "PATCH";
      requestOptionsPatch.body = JSON.stringify({
        name: name,
        email: email,
        gender: gender,
        status: status,
      });
      fetch(url + `/updateUser/${id}`, requestOptionsPatch)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let arr = userList.map((val) => {
            if (data._id === val._id) {
              return data;
            } else {
              return val;
            }
          });
          setUserList(arr);
          setModalStatus(false);
        });
    } else {
      alert("Please enter a valid email");
    }
  };

  return (
    <div className="app">
      {modalStatus ? (
        <div className="modal">
          <div className="modal__modal">
            <img
              className="modal__close"
              onClick={() => {
                setModalData({});
                setModalStatus(false);
              }}
              src={CloseIcon}
              alt=""
            />
            <input className="modal__input" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="modal__input" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="modal__selectDiv">
              <select className="modal__select" value={gender} onChange={(e) => handleChangeGender(e)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select className="modal__select" value={status} onChange={(e) => handleChangeStatus(e)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="modal__footer">
              <button className="modal__button" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="app__header">
        <div className="app__pageNo">Total pages {page}</div>
        <button className="app__button" onClick={(e) => handleFetchMoreUsers()}>
          Fetch More Users
        </button>
      </div>
      <div className="user__table">
        <div className="user__title">
          <span className="user__cn">Name</span>
          <span className="user__da">Email</span>
          <span className="user__pn">Gender</span>
          <span className="user__os">Status</span>
          <span className="user__dummy">
            <img src={arrow} alt="leftArrow" className="user__leftArrow" style={{ opacity: pageNo === 1 ? 0.3 : 1 }} onClick={(e) => handlePage("left")} />
            <span className="user__pageNo">{pageNo}</span>
            <img src={arrow} alt="rightArrow" className="user__rightArrow" style={{ opacity: pageNo === page ? 0.3 : 1 }} onClick={(e) => handlePage("right")} />
          </span>
        </div>
        <div className="user__list">
          {userList.map((data, index) => {
            return (
              <div className="user__title1">
                <span className="user__cn1">{data.name}</span>
                <span className="user__da1">{data.email}</span>
                <span className="user__pn1">{data.gender}</span>
                <span className="user__os1">{data.status}</span>
                <span className="user__dummy1">
                  <img
                    src={EditIcon}
                    alt=""
                    className="user__editIcon"
                    onClick={(e) => {
                      handleSetModalData(data);
                      setModalStatus(true);
                      setModalData(data);
                    }}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="footer">
        <button className="footer__button" onClick={(e) => handleExtractCsv("all")}>
          Extract CSV(All)
        </button>
        <button className="footer__button" onClick={(e) => handleExtractCsv("above")}>
          Extract CSV(Above)
        </button>
      </div>
    </div>
  );
}

export default App;
