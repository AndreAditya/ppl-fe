import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

function App() {
  const [NIM, setNIM] = useState("");
  const [data, setData] = useState(null); // Menyimpan data dari API

  const konversiNilai = (nilai) => {
    if (nilai >= 85) return 4.0;
    if (nilai >= 65) return 3.0;
    if (nilai >= 50) return 2.0;
    if (nilai >= 40) return 1.0;
    return 0.0;
  };

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
        `http://localhost:8080/hitung-ips/${NIM}`
      );
      const result = response.data;

      // Validasi data hasil API
      if (!result || !result.mataKuliahPerSemester) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Valid",
          text: "Data yang diterima tidak sesuai!",
        });
        return;
      }

      // Mengelompokkan nilai IPS berdasarkan semester
      const semesterMap = Object.keys(result.mataKuliahPerSemester).reduce(
        (acc, semester) => {
          const mataKuliah = result.mataKuliahPerSemester[semester];

          // Perhitungan total nilai (skala 4) dan total SKS
          const totalNilai = mataKuliah.reduce(
            (sum, mk) => sum + konversiNilai(mk.nilai) * mk.sks,
            0
          );
          const totalSKS = mataKuliah.reduce((sum, mk) => sum + mk.sks, 0);

          // Hitung IPS untuk semester ini
          const ips = totalSKS > 0 ? totalNilai / totalSKS : 0;

          acc[semester] = {
            ips: ips.toFixed(2),
            mataKuliah, // Menyimpan data mata kuliah untuk tiap semester
          };
          return acc;
        },
        {}
      );

      // Menghitung data IPS per semester
      const ipsPerSemester = Object.keys(semesterMap).map((semester) => ({
        semester,
        ips: semesterMap[semester].ips,
        mataKuliah: semesterMap[semester].mataKuliah,
      }));

      // Perbarui state dengan data IPS per semester
      setData((prevData) => ({
        ...prevData,
        ...result,
        ipsPerSemester,
      }));

      Swal.fire({
        icon: "success",
        title: "IPS Berhasil Dihitung",
      });
    } catch (error) {
      console.error("Error saat menghitung IPS:", error);
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
          Hitung IPK
        </button>
      </div>

      {data && (
        <div className="mt-4">
          <table className="table table-striped mt-3">
            <thead className="table-light">
              <tr>
                <th>NIM</th>
                <th>Nama</th>
                <th>IPK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.nim}</td>
                <td>{data.nama}</td>
                <td>{data.ipk}</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel IPS per semester */}
          <h3>IPS persemester</h3>
          <table className="table table-bordered mt-3 table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Semester</th>
                <th>IPS</th>
              </tr>
            </thead>
            <tbody>
              {data.ipsPerSemester.map((semester, index) => (
                <tr key={index}>
                  <td>{semester.semester}</td>
                  <td>{semester.ips}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabel mata kuliah per semester */}
          {data.ipsPerSemester.map((semester, index) => (
            <div key={index} className="mt-4">
              <h5>Semester {semester.semester}</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Nama Mata Kuliah</th>
                    <th>SKS</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.mataKuliah.map((mk, idx) => (
                    <tr key={idx}>
                      <td>{mk.namaMataKuliah}</td>
                      <td>{mk.sks}</td>
                      <td>{mk.nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
