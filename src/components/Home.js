import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import axios from 'axios'; 
import moment from 'moment'
import 'antd/dist/antd.css';
import { Upload, Button, message, Table, Row, Col, Card, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Column } = Table;
export class Home extends Component {
 

  constructor(props) {
    super(props);
    this.state = { fileList: [],
      uploading: false,
        deals: [],
       vehicles:[],
      errors: []};
    
  }

    componentDidMount() {

    this.getDeals();
  }
  
  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files', file);
    });

    this.setState({
      uploading: true,
    });
    this.setState({
      uploading: true,
    });

      const config = {
          headers: {
              'content-type': 'multipart/form-data',
          },
      };

      //formData.append('name', this.state.currentFile.name);

      axios.post("/api/Deal", formData, config)
          .then((res) => {
              this.setState({
                  fileList: [],
                  uploading: false,
              });
              
             

              if(!isNullOrUndefined(res.data.deals) )
              this.setState({ deals: res.data.deals});  
              this.getMostSoldVehicles();
              if (!isNullOrUndefined(res.data.errors)) {
                  this.setState({ errors: res.data.errors });
              }
              else {
                  message.success('upload successfully.');
              }
          })
          .catch(err => {
              console.log(err);
              this.setState({
                  uploading: false,
              });
              message.error('upload failed.');
          });
    

    
  };

    priceformat = (num) => {
    if (!num) { num = 0 };
    return 'CAD$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

}
getDeals = () => {
  
    axios.get("/api/Deal/GetAllVehicles")           
      .then(res => {
          const deals = res.data;
          this.setState({ deals });
          
          this.getMostSoldVehicles();
      })
      
      .catch(err => console.log(err));
}
 getMostSoldVehicles = () => {
     axios.get("/api/Deal/GetMostPopularVehicle")
            .then(res => {
                const vehicles = res.data;
                this.setState({ vehicles });
            })
            .catch(err => console.log(err));
    }
  render() {
    const { uploading, fileList } = this.state;
    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div>
         <Row style={{ marginBottom: 16 }}>
         <Col span={24} >
    {this.state.errors && this.state.errors.length > 0 ? this.state.errors.map((value, idx) =>  <><Alert message={value.message} key={idx} type="error"/><br/></>)
                           : <span></span>}
                           </Col>
                           </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col span={10} style= {{marginRight:5}}>
                    <Card title="Deal data upload">
                        <Upload {...props}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                        <Button
                            type="primary"
                            onClick={this.handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{ marginTop: 16 }}
                        >
                            {uploading ? 'Uploading' : 'Start Upload'}
                        </Button>
                    </Card>
                </Col>
               
                <Col span={12}>
                    <Card title="Most often sold vehicles">
                        {
                           this.state.vehicles.length > 0 ? this.state.vehicles.map((value, idx) => <p key={idx}>{value}</p>)
                           : <div>No data yet</div>
                         }
                        </Card>
                    </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Card title="Deals">
                        {this.state.deals.length > 0 ?
                            <Table
                                bordered
                                dataSource={this.state.deals}
                                size="small"
                                rowKey="dealNumber">
                                <Column
                                    title="Deal Number"
                                    dataIndex="dealNumber"
                                    key="dealNumber"
                                />
                                <Column
                                    title="Customer Name"
                                    dataIndex="customerName"
                                    key="customerName"

                                />
                                <Column
                                    title="Dealership Name"
                                    dataIndex="dealershipName"
                                    key="dealershipName"
                                />
                                <Column
                                    title="Vehicle"
                                    dataIndex="vehicle"
                                    key="vehicle"
                                />
                                <Column
                                    title="Price"
                                    dataIndex="price"
                                    key="price"
                                    render={price => <span>{price ? this.priceformat(price) : 0.0}</span>}
                                />
                                <Column
                                    title="Date"
                                    dataIndex="date"
                                    key="date"
                                    render={date => <span>{date ? moment(date).format("MM/DD/YYYY") : ""}</span>}
                                />
                            </Table> : "No deals yet"}
                    </Card>
                </Col>
            </Row>
      </div>
    );
  }
}
