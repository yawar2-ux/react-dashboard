'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import { Refresh, Email, MarkEmailRead, MarkEmailUnread, Search, FilterList, CalendarToday, Person, Label, SearchOff, Clear } from '@mui/icons-material';

interface Email {
  id: string;
  thread_id: string;
  sender: string;
  recipient: string;
  subject: string;
  date: string;
  email_received_at: string;
  unread: boolean;
  labels: string[];
}

interface Filters {
  query: string;
  max_results: number;
  is_unread: boolean;
  include_spam: boolean;
  date_after: string;
  date_before: string;
}

export default function EmailDashboard() {
  const theme = useTheme();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Email>('email_received_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    query: '',
    max_results: 20,
    is_unread: false,
    include_spam: false,
    date_after: '',
    date_before: ''
  });
  const [searchEmail, setSearchEmail] = useState('');

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        max_results: filters.max_results.toString(),
        is_unread: filters.is_unread.toString(),
        include_spam: filters.include_spam.toString(),
        ...(searchEmail && { sender: searchEmail }),  // Add sender filter if searchEmail exists
        ...(filters.query && { query: filters.query }),
        ...(filters.date_after && { date_after: filters.date_after }),
        ...(filters.date_before && { date_before: filters.date_before })
      });
      
      const response = await fetch(`http://127.0.0.1:8000/rag_doc/Automated_email_response/api/fetch-emails?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property: keyof Email) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#ffa000'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const sortedEmails = [...emails].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - emails.length) : 0;

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmail(null);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden', 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      p: 3,
      boxSizing: 'border-box' 
    }}>
      <Fade in timeout={800}>
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '100%', 
          overflow: 'hidden' 
        }}>
          <CardContent sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { 
              pb: { xs: 2, sm: 3, md: 4 } 
            } 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 300 }}>
                <TextField
                  size="small"
                  placeholder="Search by sender email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  sx={{
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: theme.palette.background.paper,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchEmail && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchEmail('');
                            fetchEmails();
                          }}
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchEmails();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={fetchEmails}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                    }
                  }}
                >
                  Search
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Email sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}>
                    Email Inbox
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and organize your email communications
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Refresh" arrow>
                <IconButton 
                  onClick={fetchEmails} 
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Enhanced Filter Section */}
            <Paper 
              component="form" 
              onSubmit={(e) => {
                e.preventDefault();
                fetchEmails();
              }}
              sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden', 
                maxWidth: '100%' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <FilterList color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Filters & Search
                </Typography>
              </Box>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Sender's Email"
                    name="query"
                    value={filters.query}
                    onChange={handleFilterChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    size="small"
                    placeholder="Enter sender's email"
                    helperText="Search by sender's email address"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    fullWidth
                    label="Max Results"
                    name="max_results"
                    type="number"
                    value={filters.max_results}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    inputProps={{
                      min: 1,
                      max: 1000,
                      step: 1
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_unread"
                        checked={filters.is_unread}
                        onChange={handleFilterChange}
                        color="primary"
                        sx={{
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MarkEmailUnread fontSize="small" />
                        Unread
                      </Box>
                    }
                  />
                </Grid>
                
                <Grid item xs={6} sm={3} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="include_spam"
                        checked={filters.include_spam}
                        onChange={handleFilterChange}
                        color="primary"
                      />
                    }
                    label="Include Spam"
                  />
                </Grid>
                
                <Grid item xs={12} sm={2} md={2}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<Search />}
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      background: '#4dabf5', // Light blue color
                      '&:hover': {
                        background: '#64b5f6', // Slightly lighter blue on hover
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      },
                      transition: 'all 0.3s ease',
                      '&.Mui-disabled': {
                        background: '#bbdefb', // Lighter blue when disabled
                        color: 'white'
                      }
                    }}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </Grid>
              </Grid>

              <Grid container spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date From"
                    name="date_after"
                    type="date"
                    value={filters.date_after}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date To"
                    name="date_before"
                    type="date"
                    value={filters.date_before}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {!hasSearched ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: '300px',
                  textAlign: 'center',
                  p: 4
                }}
              >
                <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.8 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Enter your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '500px', mb: 3 }}>
                  Use the filters above to search for emails. Click the "Search" button to see results.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchEmails}
                  startIcon={<Search />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                    }
                  }}
                >
                  Search Emails
                </Button>
              </Box>
            ) : loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading emails...</Typography>
              </Box>
            ) : error ? (
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>⚠️ Error</Typography>
                <Typography>{error}</Typography>
              </Paper>
            ) : emails.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: '300px',
                  textAlign: 'center',
                  p: 4
                }}
              >
                <SearchOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.8 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No emails found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '500px' }}>
                  Try adjusting your search criteria or filters.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emails.length > 0 
                      ? `Showing ${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, emails.length)} of ${emails.length} emails`
                      : 'No emails to display'}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={fetchEmails}
                    disabled={loading}
                    startIcon={<Refresh />}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      '& .MuiButton-startIcon': {
                        marginRight: 0.5
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    maxHeight: '70vh',
                    borderRadius: 2,
                    overflow: 'auto',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: theme.palette.grey[100],
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.grey[400],
                      borderRadius: '4px',
                      '&:hover': {
                        background: theme.palette.grey[500],
                      },
                    },
                  }}
                >
                  <Table stickyHeader sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ 
                        '& th': { 
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          py: 2,
                          whiteSpace: 'nowrap'
                        }
                      }}>
                        <TableCell sx={{ width: '60px' }}>#</TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'sender'}
                            direction={orderBy === 'sender' ? order : 'asc'}
                            onClick={() => handleSort('sender')}
                            sx={{ 
                              '& .MuiTableSortLabel-icon': { 
                                color: `${theme.palette.primary.main} !important` 
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" />
                              Sender
                            </Box>
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'recipient'}
                            direction={orderBy === 'recipient' ? order : 'asc'}
                            onClick={() => handleSort('recipient')}
                          >
                            Recipient
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'subject'}
                            direction={orderBy === 'subject' ? order : 'asc'}
                            onClick={() => handleSort('subject')}
                          >
                            Subject
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'email_received_at'}
                            direction={orderBy === 'email_received_at' ? order : 'desc'}
                            onClick={() => handleSort('email_received_at')}
                          >
                            Received At
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Label fontSize="small" />
                            Labels
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedEmails
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((email, index) => (
                          <TableRow
                            key={email.id}
                            hover
                            onClick={() => handleEmailClick(email)}
                            sx={{ 
                              bgcolor: email.unread ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              },
                              animation: `fadeInRow 0.6s ease-in-out ${index * 0.1}s both`
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {page * rowsPerPage + index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    bgcolor: getAvatarColor(email.sender),
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {getInitials(email.sender)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: email.unread ? 600 : 400, color: 'text.primary' }}>
                                    {email.sender}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {email.recipient}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: email.unread ? 600 : 400,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '300px'
                                }}
                              >
                                {email.subject || '(No subject)'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(email.email_received_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={email.unread ? 'Unread' : 'Read'} 
                                size="small" 
                                color={email.unread ? 'primary' : 'default'}
                                sx={{
                                  fontWeight: 600,
                                  '& .MuiChip-label': {
                                    px: 2
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {email.labels?.map((label) => (
                                  <Chip 
                                    key={label} 
                                    label={label} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{
                                      borderRadius: 2,
                                      fontSize: '0.7rem',
                                      height: 24
                                    }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                          <TableCell colSpan={7} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={emails.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    mt: 2,
                    '& .MuiTablePagination-toolbar': {
                      px: 2
                    }
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Enhanced Email Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            pt: { xs: 2, sm: 5 },
            pb: { xs: 2, sm: 5 },
          },
          '& .MuiDialog-paper': {
            m: 0,
            maxHeight: '90vh',
            overflow: 'hidden',
          },
          '& .MuiDialogContent-root': {
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 200px)', 
            p: 0,
          },
        }}
      >
        {selectedEmail && (
          <>
            <DialogTitle sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: getAvatarColor(selectedEmail.sender),
                    width: 50,
                    height: 50,
                    fontSize: '1.2rem',
                    fontWeight: 700
                  }}
                >
                  {getInitials(selectedEmail.sender)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {selectedEmail.subject || '(No subject)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email Details
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <DialogContentText component="div">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        From:
                      </Typography>
                      <Typography>{selectedEmail.sender}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        To:
                      </Typography>
                      <Typography>{selectedEmail.recipient}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        Date:
                      </Typography>
                      <Typography>{formatDate(selectedEmail.email_received_at)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        Status:
                      </Typography>
                      <Chip 
                        label={selectedEmail.unread ? 'Unread' : 'Read'} 
                        color={selectedEmail.unread ? 'primary' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        Email ID:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {selectedEmail.id}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        Thread ID:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {selectedEmail.thread_id}
                      </Typography>
                    </Paper>
                  </Grid>
                  {selectedEmail.labels && selectedEmail.labels.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                          Labels:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedEmail.labels.map((label) => (
                            <Chip 
                              key={label} 
                              label={label} 
                              variant="outlined" 
                              sx={{ 
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Button 
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style jsx global>{`
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}