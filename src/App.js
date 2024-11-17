import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

function App() {
  const [NIM, setNIM] = useState("");
  const [data, setData] = useState(null); // Menyimpan data dari API

  // Handle IPS Calculation
  const handleHitungIPS = async () => {
    if (!NIM) {
      Swal.fire({
        icon: "error",
        title: "NIM Kosong",
        text: "Harap masukkan NIM terlebih dahulu!",
      });
      return;
    }
    try {
      const response = await axios.get(
        `https://app-3e510776-7e8c-4ea1-bb2f-4e488fbc5ffc.cleverapps.io/hitung-ips/${NIM}`
      );
      const result = response.data;

      // Mengelompokkan nilai IPS berdasarkan semester
      const semesterMap = result.ipsPerSemester.reduce((acc, curr) => {
        if (!acc[curr.semester]) {
          acc[curr.semester] = [];
        }
        acc[curr.semester].push(curr.ips);
        return acc;
      }, {});

      // Menghitung IPS rata-rata per semester
      const ipsPerSemester = Object.keys(semesterMap).map((semester) => {
        const ipsArray = semesterMap[semester];
        const ipsAvg =
          ipsArray.reduce((sum, ips) => sum + ips, 0) / ipsArray.length;
        return {
          semester: semester,
          ips: ipsAvg.toFixed(2), // Menampilkan dua angka desimal
        };
      });

      // Update data state
      setData({
        ...result,
        ipsPerSemester,
      });

      Swal.fire({
        icon: "success",
        title: "IPS Berhasil Dihitung",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghitung IPS",
        text: "Terjadi kesalahan saat menghitung IPS!",
      });
    }
  };

  return (
    <div className="container mt-5 shadow p-4 rounded">
      <h1 className="text-center">Perhitungan IPK dan IPS Mahasiswa</h1>

      <div className="mb-3">
        <label htmlFor="nim" className="form-label">
          NIM:
        </label>
        <input
          id="nim"
          type="text"
          placeholder="Masukkan NIM"
          value={NIM}
          onChange={(e) => setNIM(e.target.value)}
          className="form-control"
        />
      </div>

      <div>
        <button onClick={handleHitungIPS} className="btn btn-primary">
          Hitung IPS
        </button>
      </div>

      {data && (
        <div className="mt-4">
          {/* Display Nama, NIM, and IPK */}
          {/* <h4>Nama Mahasiswa: {data.nama}</h4>
          <h5>NIM: {data.nim}</h5>
          <h5>IPK: {data.ipk}</h5> */}

          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>NIM</th>
                <th>Nama</th>
                <th>IPK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.nim}</td> {/* Menampilkan NIM */}
                <td>{data.nama}</td> {/* Menampilkan Nama Mahasiswa */}
                <td>{data.ipk}</td> {/* Menampilkan IPK */}
              </tr>
            </tbody>
          </table>

          {/* Tabel IPS per semester */}
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Semester</th>
                <th>IPS</th>
              </tr>
            </thead>
            <tbody>
              {data.ipsPerSemester.map((semester, index) => (
                <tr key={index}>
                  <td>{semester.semester}</td> {/* Menampilkan Semester */}
                  <td>{semester.ips}</td> {/* Menampilkan IPS per semester */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
